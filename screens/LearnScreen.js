// screens/LearnScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ActivityIndicator } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function LearnScreen({ navigation }) {
  const [topics, setTopics] = React.useState(null);

  React.useEffect(() => {
    const fetchTopics = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "topics"));
        const data = [];
        querySnapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setTopics(data);
      } catch (e) {
        console.error("Error fetching topics: ", e);
      }
    };
    fetchTopics();
  }, []);

  return (
    <View style={styles.container}>

      {/* HEADER WITH BACK BUTTON */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Learn PSC Topics</Text>
      </View>

      {/* SUBTITLE */}
      <Text style={styles.subtitle}>
        Bite-sized notes to build your foundation before quizzing.
      </Text>

      {/* LIST */}
      {!topics ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textMuted }}>Loading Topics...</Text>
        </View>
      ) : (
        <FlatList
          data={topics}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("TopicDetail", { topic: item })
              }
              activeOpacity={0.85}
            >
              <View
                style={[styles.iconWrap, { backgroundColor: item.color }]}
              >
                <Ionicons name={item.icon} size={22} color={COLORS.white} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>
                  {item.content?.length || 0} key points
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  backBtn: {
    marginRight: 12,
    padding: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 13.5,
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 19,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    ...SHADOW,
  },

  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  cardSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },
});