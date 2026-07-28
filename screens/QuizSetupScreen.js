import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function QuizSetupScreen({ navigation }) {
  const [mode, setMode] = useState("solo"); // 'solo' | 'opponent'
  const [opponentName, setOpponentName] = useState("");

  const start = () => {
    if (mode === "online") {
      navigation.navigate("OnlineLobby");
      return;
    }
    navigation.navigate("Quiz", {
      mode,
      rounds: 3,
      opponentName: mode === "opponent" ? (opponentName.trim() || "Opponent") : null,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up your match</Text>
      <Text style={styles.subtitle}>
        {mode === "solo" 
          ? "Solo: Win at least 13 questions per round to proceed to the next round (3 rounds)." 
          : "3 rounds. Win 2 rounds to take the match."}
      </Text>

      <View style={styles.optionRow}>
        <TouchableOpacity
          style={[styles.optionCard, mode === "solo" && styles.optionCardActive]}
          onPress={() => setMode("solo")}
        >
          <Ionicons name="person" size={26} color={mode === "solo" ? COLORS.white : COLORS.accent} />
          <Text style={[styles.optionText, mode === "solo" && styles.optionTextActive]}>Solo Practice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionCard, mode === "opponent" && styles.optionCardActive]}
          onPress={() => setMode("opponent")}
        >
          <Ionicons name="people" size={26} color={mode === "opponent" ? COLORS.white : COLORS.accent} />
          <Text style={[styles.optionText, mode === "opponent" && styles.optionTextActive]}>Pass & Play</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionCard, mode === "online" && styles.optionCardActive]}
          onPress={() => setMode("online")}
        >
          <Ionicons name="globe" size={26} color={mode === "online" ? COLORS.white : COLORS.accent} />
          <Text style={[styles.optionText, mode === "online" && styles.optionTextActive]}>Play Online</Text>
        </TouchableOpacity>
      </View>

      {mode === "opponent" && (
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Opponent's name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Arjun"
            value={opponentName}
            onChangeText={setOpponentName}
            placeholderTextColor={COLORS.textMuted}
          />
          <Text style={styles.hint}>
            Pass-and-play: each player answers the same 20 questions per round on this device, scores are compared automatically.
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.startBtn} onPress={start}>
        <Text style={styles.startBtnText}>Start Round 1</Text>
        <Ionicons name="play" size={18} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginTop: 8 },
  subtitle: { fontSize: 13.5, color: COLORS.textMuted, marginTop: 6, marginBottom: 22, lineHeight: 19 },
  optionRow: { flexDirection: "row", gap: 12 },
  optionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingVertical: 22,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 10,
  },
  optionCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: 13, fontWeight: "600", color: COLORS.text, textAlign: "center" },
  optionTextActive: { color: COLORS.white },
  inputWrap: { marginTop: 22 },
  inputLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8, fontWeight: "600" },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
    color: COLORS.text,
  },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 10, lineHeight: 17 },
  startBtn: {
    marginTop: "auto",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    ...SHADOW,
  },
  startBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
});
