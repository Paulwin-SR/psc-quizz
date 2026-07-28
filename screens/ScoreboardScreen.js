// screens/ScoreboardScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function ScoreboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState([]);
  const [myStats, setMyStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("bestScore", "desc"), limit(20));
        const snap = await getDocs(q);
        setLeaders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

        if (user) {
          const meSnap = await getDoc(doc(db, "users", user.uid));
          if (meSnap.exists()) setMyStats(meSnap.data());
        }
      } catch (e) {
        console.warn("Scoreboard load error:", e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scoreboard</Text>

      {myStats && (
        <View style={styles.myStatsCard}>
          <View style={styles.myStatsRow}>
            <Stat label="Matches" value={myStats.totalMatches || 0} />
            <Stat label="Wins" value={myStats.totalWins || 0} />
            <Stat label="Best Score" value={myStats.bestScore || 0} />
          </View>
        </View>
      )}

      <Text style={styles.sectionLabel}>Top Players</Text>
      <FlatList
        data={leaders}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            {item.photoURL ? (
              <Image source={{ uri: item.photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={16} color={COLORS.white} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.subline}>{item.totalWins || 0} wins · {item.totalMatches || 0} matches</Text>
            </View>
            <Text style={styles.score}>{item.bestScore || 0}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No scores yet. Play a match to be the first on the board!</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 16 },
  myStatsCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 22,
    ...SHADOW,
  },
  myStatsRow: { flexDirection: "row", justifyContent: "space-around" },
  statValue: { color: COLORS.white, fontSize: 20, fontWeight: "800" },
  statLabel: { color: "#CFE8DD", fontSize: 11, marginTop: 4 },
  sectionLabel: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: 10,
    gap: 12,
    ...SHADOW,
  },
  rank: { width: 22, fontWeight: "800", color: COLORS.primary, fontSize: 14 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  name: { fontWeight: "700", color: COLORS.text, fontSize: 13.5 },
  subline: { color: COLORS.textMuted, fontSize: 11.5, marginTop: 2 },
  score: { fontWeight: "800", color: COLORS.accent, fontSize: 16 },
  empty: { textAlign: "center", color: COLORS.textMuted, marginTop: 30 },
});
