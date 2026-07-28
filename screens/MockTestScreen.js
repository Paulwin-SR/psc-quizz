import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function MockTestScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Mock Tests</Text>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="time" size={24} color={COLORS.white} />
        </View>
        <Text style={styles.cardTitle}>Kerala PSC LDC Model Exam</Text>
        <Text style={styles.cardSubtitle}>100 Questions • 75 Minutes</Text>
        <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate("Quiz", { mode: "solo", rounds: 1, questionsPerRound: 100, timeLimit: 75 * 60 })}>
          <Text style={styles.startBtnText}>Start Exam</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: "#8B5CF6" }]}>
          <Ionicons name="document-text" size={24} color={COLORS.white} />
        </View>
        <Text style={styles.cardTitle}>Previous Year Paper (2022)</Text>
        <Text style={styles.cardSubtitle}>50 Questions • No Timer</Text>
        <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate("Quiz", { mode: "solo", rounds: 1, questionsPerRound: 50 })}>
          <Text style={styles.startBtnText}>Practice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 20 },
  card: { backgroundColor: COLORS.card, padding: 20, borderRadius: RADIUS.md, marginBottom: 16, ...SHADOW },
  iconContainer: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
  startBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: RADIUS.pill, alignItems: "center" },
  startBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 16 }
});
