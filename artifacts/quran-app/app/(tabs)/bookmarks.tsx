import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBookmarks } from "@/context/BookmarksContext";
import { useColors } from "@/hooks/useColors";
import type { Bookmark, Note } from "@/types";

type Tab = "bookmarks" | "notes";

export default function BookmarksScreen() {
  const colors = useColors();
  const router = useRouter();
  const { bookmarks, notes, removeBookmark, deleteNote } = useBookmarks();
  const [tab, setTab] = useState<Tab>("bookmarks");

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/surah/${item.surahNumber}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Text style={styles.badgeText}>{item.surahNumber}:{item.ayahNumber}</Text>
        </View>
        <Text style={[styles.surahName, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.surahName}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert("Remove Bookmark", "Are you sure?", [
              { text: "Cancel" },
              { text: "Remove", style: "destructive", onPress: () => removeBookmark(item.id) },
            ]);
          }}
          hitSlop={10}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.arabicPreview, { color: colors.accent }]} numberOfLines={2} textBreakStrategy="simple">
        {item.arabic}
      </Text>
      <Text style={[styles.englishPreview, { color: colors.foreground }]} numberOfLines={2}>
        {item.english}
      </Text>
    </TouchableOpacity>
  );

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/surah/${item.surahNumber}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{item.surahNumber}:{item.ayahNumber}</Text>
        </View>
        <Text style={[styles.surahName, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.surahName}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert("Delete Note", "Are you sure?", [
              { text: "Cancel" },
              { text: "Delete", style: "destructive", onPress: () => deleteNote(item.id) },
            ]);
          }}
          hitSlop={10}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.arabicPreview, { color: colors.accent }]} numberOfLines={1} textBreakStrategy="simple">
        {item.arabic}
      </Text>
      <View style={[styles.noteBox, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.noteContent, { color: colors.foreground }]} numberOfLines={3}>
          {item.content}
        </Text>
      </View>
      <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
        {new Date(item.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const activeData = tab === "bookmarks" ? bookmarks : notes;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {(["bookmarks", "notes"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, { borderBottomColor: tab === t ? colors.primary : "transparent" }]}
            onPress={() => setTab(t)}
          >
            <Ionicons
              name={t === "bookmarks" ? "bookmark" : "document-text"}
              size={16}
              color={tab === t ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            {activeData.length > 0 && tab === t && (
              <View style={[styles.countBubble, { backgroundColor: colors.primary }]}>
                <Text style={styles.countBubbleText}>{activeData.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={activeData as any[]}
        keyExtractor={(item: Bookmark | Note) => item.id}
        renderItem={tab === "bookmarks" ? renderBookmark : renderNote}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 84 : 100 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={tab === "bookmarks" ? "bookmark-outline" : "document-text-outline"}
              size={48}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No {tab} yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              {tab === "bookmarks"
                ? "Bookmark ayahs while reading"
                : "Add notes to ayahs while reading"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderBottomWidth: 2 },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  countBubble: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, alignItems: "center", justifyContent: "center" },
  countBubbleText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  list: { padding: 16, gap: 10 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 8 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  surahName: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  arabicPreview: { fontSize: 18, textAlign: "right", lineHeight: 28, writingDirection: "rtl" },
  englishPreview: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  noteBox: { borderRadius: 8, padding: 10 },
  noteContent: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  timestamp: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right" },
  empty: { alignItems: "center", paddingTop: 80, gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
