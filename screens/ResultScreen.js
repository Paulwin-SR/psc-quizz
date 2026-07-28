// screens/ResultScreen.js
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc, updateDoc, increment, serverTimestamp, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function ResultScreen({ route, navigation }) {
  const { mode, opponentName, roundHistory, p1RoundsWon, p2RoundsWon, p1Points, p2Points } = route.params;
  const isOpponent = mode === "opponent";
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  let totalP1, totalP2, youWon, isTie, winnerName, totalPossible;

  if (p1Points !== undefined) {
    // New Online mode (1 round, point based)
    totalP1 = p1Points;
    totalP2 = p2Points;
    youWon = totalP1 > totalP2;
    isTie = totalP1 === totalP2;
    winnerName = youWon ? "You" : (isTie ? "No one" : opponentName);
    totalPossible = 10;
  } else {
    // Solo or pass-n-play
    totalP1 = roundHistory.reduce((s, r) => s + r.p1, 0);
    totalP2 = isOpponent ? roundHistory.reduce((s, r) => s + (r.p2 || 0), 0) : null;
    youWon = isOpponent ? totalP1 > totalP2 : totalP1 >= 13; // For pass & play
    isTie = isOpponent && totalP1 === totalP2;
    winnerName = isOpponent ? (youWon ? "You" : (isTie ? "No one" : opponentName)) : "You";
    totalPossible = isOpponent ? 50 : roundHistory.length * 20;
  }

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const save = async () => {
      if (!user || saved) return;
      try {
        const matchRef = doc(collection(db, "matches"));
        await setDoc(matchRef, {
          userId: user.uid,
          userName: user.displayName,
          mode,
          opponentName: opponentName || null,
          totalScore: totalP1,
          opponentScore: totalP2,
          roundsWon: p1RoundsWon,
          opponentRoundsWon: p2RoundsWon || 0,
          result: isTie ? "tie" : youWon ? "win" : "loss",
          createdAt: serverTimestamp(),
        });
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          totalMatches: increment(1),
          totalWins: increment(youWon && !isTie ? 1 : 0),
          totalPoints: increment(totalP1 || 0),
          bestScore: totalP1 > 0 ? totalP1 : increment(0),
        });
        setSaved(true);
      } catch (e) {
        console.warn("Could not save score:", e.message);
      }
    };
    save();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <View style={styles.heroCard}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons
            name={isTie ? "remove-circle" : youWon ? "trophy" : "sad-outline"}
            size={72}
            color={isTie ? COLORS.textMuted : youWon ? COLORS.accent : COLORS.error}
          />
        </Animated.View>
        <Text style={styles.resultTitle}>
          {isTie ? "It's a Tie!" : youWon ? (isOpponent ? `${winnerName} Won the Match!` : "You Passed!") : (isOpponent ? `${winnerName} Won the Match!` : "Failed - Try Again")}
        </Text>
        {!isOpponent && (
          <Text style={styles.resultSub}>Target: 13 correct answers per round</Text>
        )}
        {isOpponent && (
          <Text style={styles.resultSub}>
            Your Score: {totalP1}  |  {opponentName}'s Score: {totalP2}
          </Text>
        )}
        {!isOpponent && (
          <Text style={styles.totalScore}>Total correct: {totalP1} / {totalPossible}</Text>
        )}
      </View>

      {roundHistory && roundHistory.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Round Breakdown</Text>
          <View style={styles.historyCard}>
            {roundHistory.map((r) => (
              <View key={r.round} style={styles.historyRow}>
                <Text style={styles.historyRound}>Round {r.round}</Text>
                {isOpponent ? (
                  <Text style={styles.historyScore}>You: {r.p1}/20 · {opponentName}: {r.p2}/20</Text>
                ) : (
                  <Text style={styles.historyScore}>{r.p1}/20</Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate("QuizSetup")}>
          <Text style={styles.primaryBtnText}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("Scoreboard")}>
          <Text style={styles.secondaryBtnText}>View Scoreboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.popToTop()}>
          <Text style={styles.linkBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
    ...SHADOW,
  },
  resultTitle: { fontSize: 21, fontWeight: "800", color: COLORS.text, marginTop: 14 },
  resultSub: { fontSize: 14, color: COLORS.textMuted, marginTop: 6 },
  totalScore: { fontSize: 15, fontWeight: "700", color: COLORS.primary, marginTop: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 18,
    marginBottom: 24,
    ...SHADOW,
  },
  historyRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyRound: { fontSize: 13, fontWeight: "700", color: COLORS.textMuted },
  historyScore: { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 16,
    ...SHADOW,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 15 },
  secondaryBtn: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.pill,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  secondaryBtnText: { color: COLORS.primary, fontWeight: "700", fontSize: 15 },
  linkBtn: { alignItems: "center", marginTop: 16 },
  linkBtnText: { color: COLORS.textMuted, fontSize: 13 },
});
