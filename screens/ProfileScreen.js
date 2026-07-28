import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatarLarge} />
        ) : (
          <View style={[styles.avatarLarge, styles.avatarFallback]}>
            <Ionicons name="person" size={50} color={COLORS.white} />
          </View>
        )}
        <Text style={styles.name}>{user?.displayName || "Player"}</Text>
        <Text style={styles.email}>{user?.email || "No email available"}</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        
        <View style={styles.statRow}>
          <Ionicons name="mail" size={20} color={COLORS.textMuted} />
          <Text style={styles.statLabel}>Email</Text>
          <Text style={styles.statValue}>{user?.email || "N/A"}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statRow}>
          <Ionicons name="key" size={20} color={COLORS.textMuted} />
          <Text style={styles.statLabel}>User ID</Text>
          <Text style={styles.statValue}>{user?.uid?.substring(0, 8)}...</Text>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.statRow}>
          <Ionicons name="time" size={20} color={COLORS.textMuted} />
          <Text style={styles.statLabel}>Joined</Text>
          <Text style={styles.statValue}>
            {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Recently"}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={signOut} style={styles.logoutBtn} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  profileHeader: { alignItems: "center", marginVertical: 30 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  avatarFallback: { backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 24, fontWeight: "800", color: COLORS.text, marginBottom: 5 },
  email: { fontSize: 14, color: COLORS.textMuted },
  statsCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 20, ...SHADOW, marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 15 },
  statRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  statLabel: { fontSize: 14, color: COLORS.textMuted, marginLeft: 10, flex: 1 },
  statValue: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 5 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.card, paddingVertical: 15, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.error + "40" },
  logoutText: { color: COLORS.error, fontWeight: "700", fontSize: 16, marginLeft: 8 },
});
