import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Modal, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS, RADIUS, SHADOW } from "../theme";

const MENU = [
  { key: "QuizSetup", title: "Pass & Play", desc: "Local multiplayer", icon: "people", color: "#0B6E4F" },
  { key: "OnlineLobby", title: "Live Battle", desc: "Real-time online", icon: "globe", color: "#8B5CF6" },
  { key: "CurrentAffairs", title: "Current Affairs", desc: "Daily PSC updates", icon: "newspaper", color: "#F59E0B" },
  { key: "Learn", title: "Learn Topics", desc: "History, Polity...", icon: "book", color: "#1D4ED8" },
  { key: "Notes", title: "My Notes", desc: "Personal study notes", icon: "document-text", color: "#B45309" },
  { key: "Scoreboard", title: "Scoreboard", desc: "Local top scores", icon: "trophy", color: "#BE123C" },
];

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const animValue = useRef(new Animated.Value(0)).current;
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(1500), // Pause between animations so it's not overwhelming
        Animated.timing(animValue, {
          toValue: 1,
          duration: 800, // Quick wiggle and heartbeat
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 0, // Reset instantly
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animValue]);

  // Interpolate for a double-heartbeat scale
  const scale = animValue.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [1, 1.02, 1, 1.02, 1, 1], // Very subtle scale to prevent layout breaking
  });

  // Interpolate for a left-right wiggle
  const rotate = animValue.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: ['0deg', '-15deg', '15deg', '-15deg', '15deg', '0deg'], // Stronger wiggle for the small icon
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.displayName?.split(" ")[0] || "Player"}</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerRight} 
            activeOpacity={0.7}
            onPress={() => setShowDropdown(true)}
          >
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={22} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* PROFILE DROPDOWN MODAL */}
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
            <View style={styles.dropdownOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.dropdownMenu}>
                  <Text style={styles.dropdownName} numberOfLines={1}>
                    {user?.displayName || "Player"}
                  </Text>
                  <Text style={styles.dropdownEmail} numberOfLines={1}>
                    {user?.email || "No email"}
                  </Text>
                  
                  <View style={styles.dropdownDivider} />
                  
                  <TouchableOpacity 
                    style={styles.dropdownItem} 
                    onPress={() => {
                      setShowDropdown(false);
                      navigation.navigate("Profile");
                    }}
                  >
                    <Ionicons name="person-outline" size={20} color={COLORS.text} />
                    <Text style={styles.dropdownItemText}>View Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.dropdownItem} 
                    onPress={() => {
                      setShowDropdown(false);
                      signOut();
                    }}
                  >
                    <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                    <Text style={[styles.dropdownItemText, { color: COLORS.error }]}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={styles.heroCard}>
          <Ionicons name="ribbon" size={28} color={COLORS.accent} />
          <Text style={styles.heroTitle}>Ready for today's challenge?</Text>
          <Text style={styles.heroText}>Best of 2 rounds wins the match. Sharpen your PSC GK now.</Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate("QuizSetup")}>
            <Text style={styles.heroBtnText}>Play Now</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Explore</Text>
        <View style={styles.grid}>
          {MENU.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.key)}
              activeOpacity={0.85}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={22} color={COLORS.white} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View style={{ transform: [{ scale }], marginTop: 25, marginBottom: 10 }}>
          <TouchableOpacity 
            style={styles.premiumCard} 
            onPress={() => navigation.navigate("Subscription")}
            activeOpacity={0.9}
          >
            <View style={styles.premiumContent}>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="sparkles" size={26} color="#F59E0B" />
              </Animated.View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.premiumTitle}>Unlock Premium Content</Text>
                <Text style={styles.premiumDesc}>Get exclusive mock tests, study materials & an ad-free experience.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
            </View>
          </TouchableOpacity>
        </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  greeting: { color: COLORS.textMuted, fontSize: 14 },
  name: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    padding: 22,
    marginBottom: 24,
    ...SHADOW,
  },
  heroTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700", marginTop: 10 },
  heroText: { color: "#CFE8DD", fontSize: 13, marginTop: 6, lineHeight: 18 },
  heroBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.accent,
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  heroBtnText: { color: COLORS.primaryDark, fontWeight: "700", marginRight: 6 },
  sectionLabel: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  menuCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 14,
    ...SHADOW,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  menuTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  menuDesc: { fontSize: 11.5, color: COLORS.textMuted, lineHeight: 15 },
  premiumCard: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOW,
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  premiumTitle: {
    color: "#92400E",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 4,
  },
  premiumDesc: {
    color: "#B45309",
    fontSize: 12.5,
    lineHeight: 18,
  },
  dropdownOverlay: {
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 15,
    width: 200,
    ...SHADOW,
    elevation: 5,
  },
  dropdownName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  dropdownEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 12,
  },
});
