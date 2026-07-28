// screens/NotesScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { COLORS, RADIUS, SHADOW } from "../theme";

export default function NotesScreen() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const getStorageKey = () => `notes_${user?.uid || "guest"}`;

  const loadLocalNotes = async () => {
    try {
      const saved = await AsyncStorage.getItem(getStorageKey());
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        setNotes([]);
      }
    } catch (e) {
      console.warn("Failed to load local notes:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Dual-mode load: Firestore + AsyncStorage fallback
    if (!user.isGuest && db) {
      const q = query(
        collection(db, "notes"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const unsub = onSnapshot(
        q,
        async (snap) => {
          const list = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              // Convert server timestamp to ISO string if possible
              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate().toISOString()
                : data.createdAt || new Date().toISOString(),
            };
          });
          setNotes(list);
          try {
            await AsyncStorage.setItem(getStorageKey(), JSON.stringify(list));
          } catch (e) {
            console.warn("Failed to cache notes in local storage:", e.message);
          }
          setLoading(false);
        },
        async (err) => {
          console.warn("Firestore notes listener failed, loading from local storage:", err.message);
          await loadLocalNotes();
        }
      );
      return unsub;
    } else {
      loadLocalNotes();
    }
  }, [user]);

  const addNote = async () => {
    if (!body.trim()) return;
    setSaving(true);
    const newNote = {
      id: "local-" + Date.now().toString(),
      userId: user?.uid || "guest",
      title: title.trim() || "Untitled note",
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };

    if (user && !user.isGuest && db) {
      try {
        await addDoc(collection(db, "notes"), {
          userId: user.uid,
          title: newNote.title,
          body: newNote.body,
          createdAt: serverTimestamp(),
        });
        setTitle("");
        setBody("");
      } catch (e) {
        console.warn("Firestore addDoc failed, saving note locally:", e.message);
        await saveNoteLocally(newNote);
      } finally {
        setSaving(false);
      }
    } else {
      await saveNoteLocally(newNote);
      setSaving(false);
    }
  };

  const saveNoteLocally = async (newNote) => {
    const updated = [newNote, ...notes];
    setNotes(updated);
    try {
      await AsyncStorage.setItem(getStorageKey(), JSON.stringify(updated));
    } catch (e) {
      console.error("Local save failed:", e.message);
    }
    setTitle("");
    setBody("");
  };

  const startEdit = (note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setBody(note.body);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setTitle("");
    setBody("");
  };

  const updateNote = async () => {
    if (!body.trim() || !editingNoteId) return;
    setSaving(true);
    const updatedTitle = title.trim() || "Untitled note";
    const updatedBody = body.trim();

    const isFirestoreDoc =
      user &&
      !user.isGuest &&
      db &&
      !editingNoteId.startsWith("local-") &&
      isNaN(Number(editingNoteId));

    if (isFirestoreDoc) {
      try {
        const noteRef = doc(db, "notes", editingNoteId);
        await updateDoc(noteRef, {
          title: updatedTitle,
          body: updatedBody,
        });
        setEditingNoteId(null);
        setTitle("");
        setBody("");
      } catch (e) {
        console.warn("Firestore updateDoc failed, updating note locally:", e.message);
        await updateNoteLocally(editingNoteId, updatedTitle, updatedBody);
      } finally {
        setSaving(false);
      }
    } else {
      await updateNoteLocally(editingNoteId, updatedTitle, updatedBody);
      setSaving(false);
    }
  };

  const updateNoteLocally = async (id, updatedTitle, updatedBody) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, title: updatedTitle, body: updatedBody } : n
    );
    setNotes(updated);
    try {
      await AsyncStorage.setItem(getStorageKey(), JSON.stringify(updated));
    } catch (e) {
      console.error("Local update failed:", e.message);
    }
    setEditingNoteId(null);
    setTitle("");
    setBody("");
  };

  const removeNote = (id) => {
    const performDelete = async () => {
      const isFirestoreDoc =
        user &&
        !user.isGuest &&
        db &&
        !id.startsWith("local-") &&
        isNaN(Number(id));

      if (isFirestoreDoc) {
        try {
          await deleteDoc(doc(db, "notes", id));
          return; // Firestore listener will sync the state
        } catch (e) {
          console.warn("Firestore deleteDoc failed, deleting note locally:", e.message);
        }
      }
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      try {
        await AsyncStorage.setItem(getStorageKey(), JSON.stringify(updated));
      } catch (e) {
        console.error("Local delete failed:", e.message);
      }
    };

    if (Platform.OS === "web") {
      const confirm = window.confirm("Delete note? This can't be undone.");
      if (confirm) performDelete();
    } else {
      Alert.alert("Delete note?", "This can't be undone.", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: performDelete },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>My Notes</Text>

      <View style={styles.composer}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note title (optional)"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={COLORS.textMuted}
        />
        <TextInput
          style={styles.bodyInput}
          placeholder="Write what you want to remember..."
          value={body}
          onChangeText={setBody}
          multiline
          placeholderTextColor={COLORS.textMuted}
        />
        <View style={styles.composerActions}>
          {editingNoteId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={editingNoteId ? updateNote : addNote}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons name={editingNoteId ? "checkmark" : "add"} size={18} color={COLORS.white} />
                <Text style={styles.addBtnText}>
                  {editingNoteId ? "Update Note" : "Add Note"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.noteCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteBody}>{item.body}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => startEdit(item)} style={styles.actionIconBtn}>
                  <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeNote(item.id)} style={styles.actionIconBtn}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No notes yet. Add your first one above!</Text>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 16 },
  composer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 20,
    ...SHADOW,
  },
  titleInput: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  bodyInput: { fontSize: 14, color: COLORS.text, minHeight: 70, textAlignVertical: "top" },
  composerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { color: COLORS.textMuted, fontWeight: "700", fontSize: 13 },
  addBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: "center",
    gap: 6,
  },
  addBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
  noteCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 12,
    gap: 10,
    ...SHADOW,
  },
  noteTitle: { fontWeight: "700", color: COLORS.text, fontSize: 14, marginBottom: 4 },
  noteBody: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { textAlign: "center", color: COLORS.textMuted, marginTop: 30 },
});
