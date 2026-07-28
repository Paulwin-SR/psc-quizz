// screens/QuizScreen.js
import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS, RADIUS, SHADOW } from "../theme";
import { ActivityIndicator } from "react-native";

export default function QuizScreen({ route, navigation }) {
  const mode = route?.params?.mode || "solo";
  const ROUNDS = route?.params?.rounds || 3;
  const questionsPerRound = route?.params?.questionsPerRound || 20;
  const opponentName = route?.params?.opponentName || "Opponent";
  const isOpponent = mode === "opponent";
  const timeLimit = route?.params?.timeLimit || null;
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (timeLimit === null) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLimit]);

  useEffect(() => {
    if (timeLeft === 0) {
       finishRound();
    }
  }, [timeLeft]);

  const formatTime = (secs) => {
    if (secs === null) return "";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const [roundIndex, setRoundIndex] = useState(0);
  const questionsInThisRound = (isOpponent && roundIndex === 2) ? (questionsPerRound/2) : questionsPerRound;

  const [matchRounds, setMatchRounds] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const qSnapshot = await getDocs(collection(db, "questions"));
        const allQuestions = [];
        qSnapshot.forEach(doc => allQuestions.push(doc.data()));
        
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const roundsData = [];
        for (let i = 0; i < ROUNDS; i++) {
          const start = i * questionsPerRound;
          roundsData.push(shuffled.slice(start, start + questionsPerRound));
        }
        setMatchRounds(roundsData);
      } catch (err) {
        console.error("Error fetching questions: ", err);
      }
    };
    fetchQuestions();
  }, [ROUNDS, questionsPerRound]);
  const [turn, setTurn] = useState(1);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  const [p1RoundScore, setP1RoundScore] = useState(0);
  const [p2RoundScore, setP2RoundScore] = useState(0);
  const [p1RoundsWon, setP1RoundsWon] = useState(0);
  const [p2RoundsWon, setP2RoundsWon] = useState(0);
  const [roundHistory, setRoundHistory] = useState([]);

  const [showHandoff, setShowHandoff] = useState(false);
  const [showRoundSummary, setShowRoundSummary] = useState(false);

  if (!matchRounds) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{marginTop: 10, color: COLORS.textMuted}}>Loading Questions...</Text>
      </View>
    );
  }

  const currentRoundQuestions = matchRounds[roundIndex];
  const currentQuestion = currentRoundQuestions[qIndex];

  const resetForNextQuestion = () => {
    setSelected(null);
    setLocked(false);
  };

  const handleAnswer = (idx) => {
    if (locked) return;
    setSelected(idx);
    setLocked(true);
    const correct = idx === currentQuestion.answerIndex;
    if (correct) {
      if (turn === 1) setP1RoundScore((s) => s + 1);
      else setP2RoundScore((s) => s + 1);
    }
    setTimeout(() => goNext(correct), 650);
  };

  const goNext = () => {
    const isLastQ = qIndex >= questionsInThisRound - 1;
    if (!isLastQ) {
      setQIndex((i) => i + 1);
      resetForNextQuestion();
      return;
    }

    if (isOpponent && turn === 1) {
      setShowHandoff(true);
      return;
    }

    finishRound();
  };

  const finishRound = () => {
    const p1 = p1RoundScore;
    const p2 = isOpponent ? p2RoundScore : null;
    let winner = "p1";
    if (isOpponent) {
      if (p2 > p1) winner = "p2";
      else if (p2 === p1) winner = "tie";
    }
    if (isOpponent) {
      if (winner === "p1") setP1RoundsWon((w) => w + 1);
      if (winner === "p2") setP2RoundsWon((w) => w + 1);
    } else {
      setP1RoundsWon((w) => w + 1);
    }
    setRoundHistory((h) => [...h, { round: roundIndex + 1, p1, p2 }]);
    setShowRoundSummary(true);
  };

  const proceedAfterHandoff = () => {
    setShowHandoff(false);
    setTurn(2);
    setQIndex(0);
    resetForNextQuestion();
  };

  const goToNextRound = () => {
    setShowRoundSummary(false);
    const matchDecided = isOpponent && (p1RoundsWon === 2 || p2RoundsWon === 2);
    const lastRound = roundIndex >= ROUNDS - 1;
    const soloFailed = !isOpponent && p1RoundScore < 13;

    if (matchDecided || lastRound || soloFailed) {
      navigation.replace("Result", {
        mode,
        opponentName,
        roundHistory: [...roundHistory],
        p1RoundsWon,
        p2RoundsWon,
        rounds: ROUNDS,
      });
      return;
    }

    setRoundIndex((r) => r + 1);
    setTurn(1);
    setQIndex(0);
    setP1RoundScore(0);
    setP2RoundScore(0);
    resetForNextQuestion();
  };

  if (showHandoff) {
    return (
      <View style={styles.centerScreen}>
        <Ionicons name="swap-horizontal" size={48} color={COLORS.primary} />
        <Text style={styles.handoffTitle}>Pass the device to {opponentName}</Text>
        <Text style={styles.handoffText}>
          Round {roundIndex + 1} — {opponentName} will now answer the same {questionsInThisRound} questions.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={proceedAfterHandoff}>
          <Text style={styles.primaryBtnText}>I'm Ready</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showRoundSummary) {
    const matchDecided = isOpponent && (p1RoundsWon === 2 || p2RoundsWon === 2);
    const soloFailed = !isOpponent && p1RoundScore < 13;
    const isFinalCard = matchDecided || roundIndex >= ROUNDS - 1 || soloFailed;
    
    return (
      <View style={styles.centerScreen}>
        <Ionicons name={soloFailed ? "close-circle" : "ribbon"} size={48} color={soloFailed ? COLORS.error : COLORS.accent} />
        <Text style={styles.handoffTitle}>{soloFailed ? "Round Failed" : `Round ${roundIndex + 1} Complete`}</Text>
        {isOpponent ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryScore}>You: {p1RoundScore}/{questionsInThisRound}</Text>
            <Text style={styles.summaryScore}>{opponentName}: {p2RoundScore}/{questionsInThisRound}</Text>
          </View>
        ) : (
          <Text style={styles.summaryScore}>Score: {p1RoundScore}/{questionsInThisRound}</Text>
        )}
        <Text style={styles.handoffText}>
          {soloFailed ? "You need 13 to pass. Match over!" : (isFinalCard ? "Tap below to see the final result." : "Tap below to continue to the next round.")}
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={goToNextRound}>
          <Text style={styles.primaryBtnText}>{isFinalCard ? "See Final Result" : "Next Round"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const playerLabel = isOpponent ? (turn === 1 ? "You" : opponentName) : "You";
  const progressPct = ((qIndex + 1) / questionsInThisRound) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.roundLabel}>Round {roundIndex + 1} / {ROUNDS}</Text>
        {timeLimit !== null ? (
          <Text style={[styles.turnLabel, { color: timeLeft < 60 ? COLORS.error : COLORS.primary }]}>
            {formatTime(timeLeft)}
          </Text>
        ) : (
          <Text style={styles.turnLabel}>{playerLabel}'s turn</Text>
        )}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>
      <Text style={styles.qCounter}>Question {qIndex + 1} of {questionsInThisRound}</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.questionCard}>
          <Text style={styles.categoryTag}>{currentQuestion.category}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {currentQuestion.options.map((opt, idx) => {
          const isCorrect = idx === currentQuestion.answerIndex;
          const isSelected = idx === selected;
          let style = styles.optionBtn;
          if (locked && isCorrect) style = [styles.optionBtn, styles.optionCorrect];
          else if (locked && isSelected && !isCorrect) style = [styles.optionBtn, styles.optionWrong];
          else if (isSelected) style = [styles.optionBtn, styles.optionSelected];

          return (
            <TouchableOpacity
              key={idx}
              style={style}
              onPress={() => handleAnswer(idx)}
              disabled={locked}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  centerScreen: { flex: 1, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center", padding: 20 },
  handoffTitle: { fontSize: 24, fontWeight: "800", color: COLORS.text, marginTop: 20, textAlign: "center" },
  handoffText: { fontSize: 16, color: COLORS.textMuted, marginTop: 12, textAlign: "center", lineHeight: 22 },
  primaryBtn: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    paddingHorizontal: 32,
    ...SHADOW,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
  summaryRow: { flexDirection: "row", gap: 20, marginTop: 20 },
  summaryScore: { fontSize: 20, fontWeight: "700", color: COLORS.text, marginTop: 10 },
  topBar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, marginTop: 10 },
  roundLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1 },
  turnLabel: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  progressTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginBottom: 10, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: COLORS.accent },
  qCounter: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 20 },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  optionBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 18,
    marginBottom: 12,
  },
  optionSelected: { borderColor: COLORS.accent, backgroundColor: "#FFF9E6" },
  optionCorrect: { borderColor: COLORS.success, backgroundColor: "#EAF8F0" },
  optionWrong: { borderColor: COLORS.error, backgroundColor: "#FDECEC" },
  optionText: { fontSize: 15, color: COLORS.text, fontWeight: "500", lineHeight: 22 },
  optionTextSelected: { color: COLORS.primaryDark, fontWeight: "700" },
});
