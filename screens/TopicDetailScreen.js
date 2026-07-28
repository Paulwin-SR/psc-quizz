// screens/TopicDetailScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function TopicDetailScreen({ route }) {
  const { topic } = route.params;

  if (!topic) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <View style={[styles.header, { backgroundColor: topic.color }]}>
        <Ionicons name={topic.icon} size={30} color={COLORS.white} />
        <Text style={styles.headerTitle}>{topic.title}</Text>
      </View>

      {topic.content.map((point, idx) => (
        <View key={idx} style={styles.pointCard}>
          <View style={styles.bullet}>
            <Text style={styles.bulletText}>{idx + 1}</Text>
          </View>
          <Text style={styles.pointText}>{point}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    borderRadius: RADIUS.lg,
    padding: 22,
    marginBottom: 20,
    ...SHADOW,
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: "800", marginTop: 10 },
  pointCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    ...SHADOW,
  },
  bullet: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  bulletText: { fontWeight: "700", color: COLORS.primary, fontSize: 12 },
  pointText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 21 },
});
