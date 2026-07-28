import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function RankingsScreen() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("totalPoints", "desc"), limit(20));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc, index) => ({
          id: doc.id,
          name: doc.data().displayName || "Player",
          score: doc.data().totalPoints || 0,
          rank: index + 1
        }));
        setLeaders(data);
      } catch (e) {
        console.warn("Failed to fetch rankings:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{item.rank}</Text>
      </View>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color={COLORS.white} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.score}>{item.score} pts</Text>
      </View>
      {item.rank <= 3 && <Ionicons name="medal" size={24} color={item.rank === 1 ? "#F59E0B" : item.rank === 2 ? "#9CA3AF" : "#D97706"} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statewide Rank</Text>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 20 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, padding: 16, borderRadius: RADIUS.md, marginBottom: 12, ...SHADOW },
  rankBadge: { width: 30, alignItems: "center", marginRight: 10 },
  rankText: { fontSize: 16, fontWeight: "800", color: COLORS.textMuted },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  score: { fontSize: 13, color: COLORS.primary, fontWeight: "600" }
});
