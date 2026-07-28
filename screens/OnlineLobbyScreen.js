// screens/OnlineLobbyScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ImageBackground, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
// Removed local buildMatchQuestions as we fetch from DB now
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function OnlineLobbyScreen({ navigation }) {
  const { user } = useAuth();
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [myRoom, setMyRoom] = useState(null);
  const [isRandom, setIsRandom] = useState(false);
  const [randomMatchTimeout, setRandomMatchTimeout] = useState(null);
  const [waitTimer, setWaitTimer] = useState(15);

  useEffect(() => {
    let interval;
    if (myRoom) {
      setWaitTimer(15);
      interval = setInterval(() => {
        setWaitTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [myRoom]);

  useEffect(() => {
    return () => {
      if (randomMatchTimeout) clearTimeout(randomMatchTimeout);
    };
  }, [randomMatchTimeout]);

  // Listen to the created room to see if someone joins
  useEffect(() => {
    if (!myRoom) return;
    const unsub = onSnapshot(doc(db, "rooms", myRoom), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.p2 && data.p2.uid) {
          // Opponent joined
          navigation.replace("OnlineQuiz", { roomId: myRoom, isHost: true });
        }
      }
    });
    return unsub;
  }, [myRoom]);

  const createRoom = async () => {
    if (!playerName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    if (creating) return;
    setCreating(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); 
      
      // Fetch questions from DB
      const qSnapshot = await getDocs(collection(db, "questions"));
      const allQuestions = [];
      qSnapshot.forEach(doc => allQuestions.push(doc.data()));
      
      // Pick 10 random questions
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, 10);
      
      const newRoom = {
        roomCode: code,
        hostId: user.uid,
        status: "waiting",
        createdAt: serverTimestamp(),
        matchData: {
          round1: selectedQuestions
        },
        currentQuestionIndex: 0,
        questionStartTime: null,
        p1: { 
          uid: user.uid,
          name: playerName.trim() || "Player 1", 
          answers: {}, 
          points: 0,
          finishedRounds: 0 
        },
        p2: null,
      };

      await setDoc(doc(db, "rooms", code), newRoom);
      setIsRandom(false);
      setMyRoom(code);
      
      const t = setTimeout(async () => {
          const roomSnap = await getDoc(doc(db, "rooms", code));
          if (roomSnap.exists() && roomSnap.data().status === "waiting") {
             await updateDoc(doc(db, "rooms", code), { status: "cancelled" });
             setMyRoom(null);
             Alert.alert("Timeout", "No one joined your room in time. Try again!");
             navigation.goBack();
          }
      }, 15000);
      setRandomMatchTimeout(t);
    } catch (e) {
      console.error("Create Room Error:", e);
      Alert.alert("Error", String(e.message || e));
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    if (!roomCode.trim() || joining) return;
    setJoining(true);
    try {
      const code = roomCode.trim();
      const roomRef = doc(db, "rooms", code);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        Alert.alert("Error", "Room not found.");
        setJoining(false);
        return;
      }

      const data = roomSnap.data();
      if (data.p2) {
        Alert.alert("Error", "Room is already full.");
        setJoining(false);
        return;
      }

        await updateDoc(roomRef, {
          p2: { 
            uid: user.uid,
            name: playerName.trim() || "Player 2", 
            answers: {}, 
            points: 0,
            finishedRounds: 0 
          },
          status: "playing",
          questionStartTime: serverTimestamp(),
        });

      navigation.replace("OnlineQuiz", { roomId: code, isHost: false });
    } catch (e) {
      Alert.alert("Error", "Could not join room.");
      setJoining(false);
    }
  };

  const findRandomMatch = async () => {
    if (!playerName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    if (joining || creating) return;
    setJoining(true);
    try {
      const roomsRef = collection(db, "rooms");
      const q = query(roomsRef, where("status", "==", "waiting"), limit(5));
      const querySnapshot = await getDocs(q);
      
      const validRoom = querySnapshot.docs.find(d => d.data().hostId !== user.uid);
      
      if (validRoom) {
        const code = validRoom.id;
        const roomRef = doc(db, "rooms", code);
        
        await updateDoc(roomRef, {
          p2: { 
            uid: user.uid,
            name: playerName.trim() || "Player 2", 
            answers: {}, 
            points: 0,
            finishedRounds: 0 
          },
          status: "playing",
          questionStartTime: serverTimestamp(),
        });
        navigation.replace("OnlineQuiz", { roomId: code, isHost: false });
      } else {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Fetch questions from DB
        const qSnapshot = await getDocs(collection(db, "questions"));
        const allQuestions = [];
        qSnapshot.forEach(doc => allQuestions.push(doc.data()));
        
        // Pick 10 random questions
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 10);
        
        const newRoom = {
          roomCode: code,
          hostId: user.uid,
          status: "waiting",
          createdAt: serverTimestamp(),
          matchData: {
            round1: selectedQuestions
          },
          currentQuestionIndex: 0,
          questionStartTime: null,
          p1: { 
            uid: user.uid,
            name: playerName.trim() || "Player 1", 
            answers: {}, 
            points: 0,
            finishedRounds: 0 
          },
          p2: null,
        };

        await setDoc(doc(db, "rooms", code), newRoom);
        setIsRandom(true);
        setMyRoom(code);
        
        const t = setTimeout(async () => {
          const roomSnap = await getDoc(doc(db, "rooms", code));
          if (roomSnap.exists() && roomSnap.data().status === "waiting") {
             await updateDoc(doc(db, "rooms", code), { status: "cancelled" });
             setMyRoom(null);
             Alert.alert("Timeout", "No one is online please try again");
             navigation.goBack();
          }
        }, 15000);
        setRandomMatchTimeout(t);
      }
    } catch (e) {
      console.error("Matchmaking Error:", e);
      Alert.alert("Error", "Could not find a match.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Online Multiplayer</Text>
      
      {myRoom ? (
        <View style={styles.card}>
          {isRandom ? (
            <>
              <Text style={styles.subtitle}>Finding Opponent</Text>
              <Text style={[styles.hint, { marginTop: 10 }]}>Please wait while we connect you with a random player...</Text>
              <Text style={{ fontSize: 32, fontWeight: "800", color: COLORS.primary, marginTop: 10 }}>{waitTimer}s</Text>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>Your Room Code</Text>
              <Text style={styles.codeText}>{myRoom}</Text>
              <Text style={styles.hint}>Share this code with your friend. Waiting for them to join...</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.error, marginTop: 5 }}>Cancels in {waitTimer}s</Text>
            </>
          )}
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.card}>
            <Text style={styles.subtitle}>Your Name</Text>
            <TextInput
              style={[styles.input, { letterSpacing: 0, marginBottom: 0, borderColor: nameError ? COLORS.error : COLORS.border }]}
              placeholder="Enter your display name"
              value={playerName}
              onChangeText={(text) => {
                setPlayerName(text);
                if (text.trim()) setNameError(false);
              }}
              maxLength={15}
            />
            {nameError && (
              <Text style={{ color: COLORS.error, fontSize: 13, marginTop: 8, fontWeight: "600" }}>
                Please enter a display name first!
              </Text>
            )}
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
          </View>

          <View style={[styles.card, { borderColor: COLORS.accent, backgroundColor: "#F0FDF4" }]}>
            <Text style={styles.subtitle}>Play with Anyone</Text>
            <Text style={styles.hint}>Find a random opponent online right now.</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.accent }]} onPress={findRandomMatch} disabled={joining || creating}>
              {(joining && !roomCode) ? (
                <View style={{flexDirection: "row", alignItems: "center"}}>
                  <ActivityIndicator color={COLORS.primaryDark} style={{marginRight: 10}} />
                  <Text style={[styles.btnText, { color: COLORS.primaryDark }]}>Waiting for opponent...</Text>
                </View>
              ) : (
                <Text style={[styles.btnText, { color: COLORS.primaryDark }]}>Find Random Match</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR PLAY WITH FRIEND</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitle}>Create a Room</Text>
            <Text style={styles.hint}>Host a private game and invite a friend.</Text>
            <TouchableOpacity style={styles.btn} onPress={createRoom} disabled={creating || joining}>
              {creating ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Create Room</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitle}>Join a Room</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              value={roomCode}
              onChangeText={setRoomCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={joinRoom} disabled={joining}>
              {joining ? <ActivityIndicator color={COLORS.primary} /> : <Text style={styles.btnOutlineText}>Join Room</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text, marginBottom: 30, textAlign: "center" },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
    alignItems: "center",
  },
  subtitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  hint: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", marginBottom: 20 },
  codeText: { fontSize: 40, fontWeight: "800", color: COLORS.primary, letterSpacing: 4, marginVertical: 10 },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: RADIUS.pill,
    width: "100%",
    alignItems: "center",
  },
  btnText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
  btnOutline: { backgroundColor: "transparent", borderWidth: 2, borderColor: COLORS.primary },
  btnOutlineText: { color: COLORS.primary, fontWeight: "700", fontSize: 16 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { marginHorizontal: 15, color: COLORS.textMuted, fontWeight: "700" },
  input: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 16,
  }
});
