// screens/AuthScreen.js
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function AuthScreen() {
  const { signInWithGoogle, signInAsGuest, googleRequestReady } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logoCircle}>
          <Ionicons name="school" size={42} color={COLORS.white} />
        </View>
        <Text style={styles.title}>PSC Quiz Arena</Text>
        <Text style={styles.subtitle}>Learn. Compete. Win.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome</Text>
        <Text style={styles.cardText}>
          Sign in to save your scores, climb the leaderboard, and challenge friends in PSC GK quiz battles.
        </Text>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={signInWithGoogle}
          disabled={!googleRequestReady}
        >
          {googleRequestReady ? (
            <>
              <Ionicons name="logo-google" size={20} color={COLORS.white} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          ) : (
            <ActivityIndicator color={COLORS.white} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestBtn}
          onPress={signInAsGuest}
        >
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <Text style={styles.guestBtnText}>Continue as Guest / Mock Login</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Free for everyone · Built for PSC aspirants</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 28,
  },
  brand: { alignItems: "center", marginTop: 30 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { fontSize: 30, fontWeight: "800", color: COLORS.white },
  subtitle: { fontSize: 15, color: "#D7EDE3", marginTop: 6 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 26,
    ...SHADOW,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  cardText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20, marginBottom: 22 },
  googleBtn: {
    flexDirection: "row",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  googleBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 15, marginLeft: 8 },
  guestBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  guestBtnText: { color: COLORS.primary, fontWeight: "700", fontSize: 15, marginLeft: 8 },
  footer: { textAlign: "center", color: "#CFE8DD", fontSize: 12 },
});
