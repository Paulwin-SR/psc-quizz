import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Linking, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function CurrentAffairsScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch live data
        let liveData = [];
        try {
          const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.thehindu.com/news/national/feeder/default.rss");
          const data = await res.json();
          if (data.items) {
            liveData = data.items.slice(0, 5).map(item => ({
              title: item.title,
              category: item.categories?.[0] || "National",
              pubDate: item.pubDate,
              link: item.link
            }));
          }
        } catch (e) {
          console.warn("Live API failed", e);
        }

        // 2. Fetch historical data from Firebase
        const q = query(collection(db, "current_affairs"), orderBy("pubDate", "desc"));
        const snapshot = await getDocs(q);
        const historicalData = snapshot.docs.map(doc => doc.data());

        // Combine and set
        setNews([...liveData, ...historicalData]);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Current Affairs (India)</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search news or category..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : filteredNews.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textMuted }}>No results found for "{searchQuery}"</Text>
      ) : (
        filteredNews.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card} onPress={() => Linking.openURL(item.link)} activeOpacity={0.8}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.category || "National"}</Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <View style={styles.meta}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{new Date(item.pubDate).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 20 },
  card: { backgroundColor: COLORS.card, padding: 20, borderRadius: RADIUS.md, marginBottom: 16, ...SHADOW },
  badge: { alignSelf: "flex-start", backgroundColor: "#E0F2FE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm, marginBottom: 10 },
  badgeText: { color: "#0284C7", fontSize: 12, fontWeight: "700" },
  newsTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  meta: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 13, color: COLORS.textMuted, marginLeft: 6 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    marginBottom: 20,
    ...SHADOW,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    height: "100%",
    outlineStyle: "none",
  },
  clearBtn: {
    padding: 4,
  }
});
