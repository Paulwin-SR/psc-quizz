import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOW } from "../theme";

const VIDEOS = [
  { id: "1", title: "LDC 2024 - Kerala Renaissance Revision", subtitle: "History • 1 hr 20 mins", thumbnail: "https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=800&q=80", url: "https://www.youtube.com/results?search_query=Kerala+PSC+Renaissance+Class" },
  { id: "2", title: "Indian Constitution Important Articles", subtitle: "Polity • 45 mins", thumbnail: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80", url: "https://www.youtube.com/results?search_query=Kerala+PSC+Indian+Constitution" },
  { id: "3", title: "Mathematics: Percentage Shortcuts", subtitle: "Arithmetic • 30 mins", thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80", url: "https://www.youtube.com/results?search_query=Kerala+PSC+Maths+Percentage" }
];

export default function VideoClassesScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Video Classes</Text>
      {VIDEOS.map((vid) => (
        <TouchableOpacity key={vid.id} style={styles.card} activeOpacity={0.8} onPress={() => Linking.openURL(vid.url)}>
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: vid.thumbnail }} style={styles.thumbnail} />
            <View style={styles.playOverlay}>
              <Ionicons name="play" size={32} color={COLORS.white} />
            </View>
          </View>
          <View style={styles.info}>
            <Text style={styles.vidTitle}>{vid.title}</Text>
            <Text style={styles.vidSubtitle}>{vid.subtitle}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.md, marginBottom: 20, overflow: "hidden", ...SHADOW },
  thumbnailContainer: { height: 160, width: "100%", position: "relative" },
  thumbnail: { width: "100%", height: "100%" },
  playOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  info: { padding: 16 },
  vidTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  vidSubtitle: { fontSize: 13, color: COLORS.textMuted }
});
