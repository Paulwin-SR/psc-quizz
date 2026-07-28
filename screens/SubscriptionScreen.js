import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function SubscriptionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="diamond" size={80} color="#F59E0B" style={styles.icon} />
        <Text style={styles.title}>Unlock Premium</Text>
        <Text style={styles.subtitle}>
          Get access to thousands of advanced PSC questions, exclusive study materials, and unlimited mock tests.
        </Text>
        
        <View style={styles.featuresList}>
          {["Unlimited Mock Tests", "Detailed Answer Explanations", "Ad-free Experience", "Priority Support"].map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.priceText}>₹499 / year</Text>
        <TouchableOpacity style={styles.payBtn} onPress={() => alert("Payment Gateway Integration Pending")}>
          <Text style={styles.payBtnText}>Proceed to Payment</Text>
          <Ionicons name="lock-closed" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 30, alignItems: "center", justifyContent: "center" },
  icon: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "900", color: COLORS.text, marginBottom: 12, textAlign: "center" },
  subtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: "center", lineHeight: 22, marginBottom: 30 },
  featuresList: { width: "100%", backgroundColor: COLORS.card, padding: 20, borderRadius: RADIUS.lg, ...SHADOW },
  featureItem: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  featureText: { fontSize: 15, color: COLORS.text, fontWeight: "500" },
  footer: { padding: 20, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW },
  priceText: { fontSize: 24, fontWeight: "800", color: COLORS.primary, textAlign: "center", marginBottom: 15 },
  payBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  payBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
