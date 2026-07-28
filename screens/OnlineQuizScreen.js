// screens/OnlineQuizScreen.js
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS, RADIUS, SHADOW } from "../theme";

const QUESTIONS_PER_ROUND = 10;

export default function OnlineQuizScreen({ route, navigation }) {
  const { roomId, isHost } = route.params;
  const [roomData, setRoomData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "rooms", roomId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRoomData(data);
      }
    });
    return unsub;
  }, [roomId]);

  const currentQIndex = roomData?.currentQuestionIndex || 0;
  const matchRounds = roomData?.matchData?.round1;
  const currentQuestion = matchRounds ? matchRounds[currentQIndex] : null;

  const myKey = isHost ? "p1" : "p2";
  const oppKey = isHost ? "p2" : "p1";
  
  // When question changes, reset local state and timer
  useEffect(() => {
    setLocked(false);
    setSelected(null);
    setTimeLeft(10);

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQIndex]);

  // Host Logic: Monitor answers and timer to progress game
  useEffect(() => {
    if (!isHost || !roomData) return;

    if (currentQIndex >= QUESTIONS_PER_ROUND) {
      // Game Over
      navigation.replace("Result", {
        mode: "opponent",
        opponentName: roomData[oppKey]?.name || "Opponent",
        p1Points: roomData[myKey].points,
        p2Points: roomData[oppKey].points,
      });
      return;
    }

    const p1Answered = roomData.p1.answers[currentQIndex] !== undefined;
    const p2Answered = roomData.p2.answers[currentQIndex] !== undefined;

    const shouldProgress = (p1Answered && p2Answered) || timeLeft === 0;

    if (shouldProgress) {
      // Add a small delay so users see what happened before instantly switching
      const timer = setTimeout(async () => {
        try {
          await updateDoc(doc(db, "rooms", roomId), {
            currentQuestionIndex: currentQIndex + 1,
            questionStartTime: serverTimestamp()
          });
        } catch (e) {
          console.error("Failed to progress question:", e);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isHost, roomData, currentQIndex, timeLeft]);

  // Non-host game over check
  useEffect(() => {
    if (!isHost && currentQIndex >= QUESTIONS_PER_ROUND && roomData) {
      navigation.replace("Result", {
        mode: "opponent",
        opponentName: roomData[oppKey]?.name || "Opponent",
        p1Points: roomData[myKey].points,
        p2Points: roomData[oppKey].points,
      });
    }
  }, [isHost, currentQIndex, roomData]);

  if (!roomData || !currentQuestion) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{marginTop: 10, color: COLORS.textMuted}}>Starting match...</Text>
      </View>
    );
  }

  const handleAnswer = async (idx) => {
    if (locked || timeLeft === 0) return;
    
    setLocked(true);
    setSelected(idx);
    
    const correct = idx === currentQuestion.answerIndex;
    
    try {
      const updates = {
        [`${myKey}.answers.${currentQIndex}`]: idx,
      };
      if (correct) {
        updates[`${myKey}.points`] = roomData[myKey].points + 1;
      }
      await updateDoc(doc(db, "rooms", roomId), updates);
    } catch (e) {
      console.error("Failed to submit answer:", e);
    }
  };

  const opponentName = roomData[oppKey]?.name || "Opponent";
  const myPoints = roomData[myKey]?.points || 0;
  const oppPoints = roomData[oppKey]?.points || 0;

  const hasAnswered = roomData[myKey]?.answers?.[currentQIndex] !== undefined;
  const oppAnswerIdx = roomData[oppKey]?.answers?.[currentQIndex];
  
  const p1Answered = roomData.p1?.answers?.[currentQIndex] !== undefined;
  const p2Answered = roomData.p2?.answers?.[currentQIndex] !== undefined;
  const shouldProgress = (p1Answered && p2Answered) || timeLeft === 0;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.roundLabel}>Question {currentQIndex + 1} / {QUESTIONS_PER_ROUND}</Text>
        <Text style={styles.turnLabel}>Timer: {timeLeft}s</Text>
      </View>
      
      <View style={styles.scoreBoard}>
        <Text style={styles.scoreText}>You: {myPoints}</Text>
        <Text style={styles.scoreText}>{opponentName}: {oppPoints}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(timeLeft / 10) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.questionCard}>
          <Text style={styles.categoryTag}>{currentQuestion.category}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {currentQuestion.options.map((opt, idx) => {
          const reveal = hasAnswered || shouldProgress;
          const isCorrect = idx === currentQuestion.answerIndex;
          const isSelected = idx === selected;
          const isOppSelected = idx === oppAnswerIdx;
          
          let style = styles.option;
          if (reveal && isCorrect) style = [styles.option, styles.optionCorrect];
          else if (reveal && isSelected && !isCorrect) style = [styles.option, styles.optionWrong];
          // If the opponent selected this, and we're revealing, maybe style it slightly differently if it's not correct and not ours
          else if (shouldProgress && isOppSelected && !isCorrect) style = [styles.option, styles.optionOppWrong];

          return (
            <TouchableOpacity
              key={idx}
              style={style}
              onPress={() => handleAnswer(idx)}
              disabled={locked || timeLeft === 0 || hasAnswered}
              activeOpacity={0.8}
            >
              <View style={styles.optionLetter}>
                <Text style={styles.optionLetterText}>{String.fromCharCode(65 + idx)}</Text>
              </View>
              <Text style={styles.optionText}>{opt}</Text>
              
              {shouldProgress && isOppSelected && (
                <View style={styles.oppBadge}>
                  <Text style={styles.oppBadgeText}>{opponentName} chose this</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        
        {hasAnswered && timeLeft > 0 && (
          <Text style={styles.waitingText}>Waiting for {opponentName}...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  topBar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  roundLabel: { fontWeight: "700", color: COLORS.text, fontSize: 16 },
  turnLabel: { fontWeight: "800", color: COLORS.error, fontSize: 16 },
  scoreBoard: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, paddingHorizontal: 10 },
  scoreText: { fontWeight: "700", color: COLORS.primary, fontSize: 14 },
  progressTrack: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: "hidden", marginBottom: 20 },
  progressFill: { height: "100%", backgroundColor: COLORS.error },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 18,
    ...SHADOW,
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "#E7F4EE",
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginBottom: 12,
  },
  questionText: { fontSize: 17, fontWeight: "700", color: COLORS.text, lineHeight: 24 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  optionCorrect: { borderColor: COLORS.success, backgroundColor: "#EAF8F0" },
  optionWrong: { borderColor: COLORS.error, backgroundColor: "#FDECEC" },
  optionOppWrong: { borderColor: COLORS.accent, backgroundColor: "#FFF8ED", borderStyle: "dashed" },
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionLetterText: { fontWeight: "700", color: COLORS.primary, fontSize: 13 },
  optionText: { flex: 1, fontSize: 14.5, color: COLORS.text, fontWeight: "500" },
  centerScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  waitingText: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 15,
    fontStyle: "italic",
  },
  oppBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginLeft: 10,
  },
  oppBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
  }
});
