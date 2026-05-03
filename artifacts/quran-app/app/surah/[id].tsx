import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { NoteModal } from "@/components/NoteModal";
import { TafseerSheet } from "@/components/TafseerSheet";
import { WordAnalysisSheet } from "@/components/WordAnalysisSheet";
import { useAudio } from "@/context/AudioContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { fetchSurah } from "@/services/quranService";
import type { AyahData } from "@/types";

interface SheetState {
  type: "word" | "tafseer" | "note" | null;
  ayah: AyahData | null;
}

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahNumber = parseInt(id ?? "1", 10);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, arabicFontSize, translationFontSize } = useSettings();
  const { isBookmarked, addBookmark, removeBookmark, bookmarks, addNote, deleteNote, getNoteForAyah } = useBookmarks();
  const { playAyah, nowPlaying, isPlaying } = useAudio();
  const [sheet, setSheet] = useState<SheetState>({ type: null, ayah: null });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["surah", surahNumber],
    queryFn: () => fetchSurah(surahNumber),
    staleTime: Infinity,
  });

  const closeSheet = useCallback(() => setSheet({ type: null, ayah: null }), []);

  const handleBookmark = useCallback((ayah: AyahData) => {
    if (!data) return;
    const bk = bookmarks.find((b) => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah);
    if (bk) {
      removeBookmark(bk.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      addBookmark({
        surahNumber,
        surahName: data.surahMeta.englishName,
        ayahNumber: ayah.numberInSurah,
        arabic: ayah.arabic,
        english: ayah.english,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [bookmarks, surahNumber, data, addBookmark, removeBookmark]);

  const handlePlay = useCallback((ayah: AyahData) => {
    if (!data) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playAyah({
      surahNumber,
      surahName: data.surahMeta.englishName,
      ayahNumber: ayah.numberInSurah,
      totalAyahs: data.surahMeta.numberOfAyahs,
      reciter: settings.reciter,
    });
  }, [data, surahNumber, settings.reciter, playAyah]);

  const renderAyah = useCallback(({ item }: { item: AyahData }) => {
    const bookmarked = isBookmarked(surahNumber, item.numberInSurah);
    const hasNote = !!getNoteForAyah(surahNumber, item.numberInSurah);
    const isCurrentlyPlaying = nowPlaying?.surahNumber === surahNumber && nowPlaying?.ayahNumber === item.numberInSurah && isPlaying;

    return (
      <View style={[styles.ayahCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.ayahHeader}>
          <View style={[styles.ayahNumBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.ayahNumText, { color: colors.primaryForeground }]}>{item.numberInSurah}</Text>
          </View>
          <View style={styles.metaBadges}>
            {item.juz > 0 && (
              <View style={[styles.metaBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.metaBadgeText, { color: colors.primary }]}>Juz {item.juz}</Text>
              </View>
            )}
            {item.sajda && (
              <View style={[styles.metaBadge, { backgroundColor: "#fef3c7" }]}>
                <Text style={[styles.metaBadgeText, { color: "#b45309" }]}>Sajda</Text>
              </View>
            )}
          </View>
        </View>

        <Text
          style={[styles.arabicText, { color: colors.foreground, fontSize: arabicFontSize }]}
          textBreakStrategy="simple"
        >
          {item.arabic}
        </Text>

        {settings.language === "en" && (
          <Text style={[styles.translationText, { color: colors.mutedForeground, fontSize: translationFontSize }]}>
            {item.english}
          </Text>
        )}
        {settings.language === "ur" && (
          <Text
            style={[styles.urduText, { color: colors.mutedForeground, fontSize: translationFontSize }]}
            textBreakStrategy="simple"
          >
            {item.urdu}
          </Text>
        )}

        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setSheet({ type: "word", ayah: item })}
            hitSlop={8}
          >
            <Ionicons name="text-outline" size={18} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setSheet({ type: "tafseer", ayah: item })}
            hitSlop={8}
          >
            <Ionicons name="book-outline" size={18} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleBookmark(item)}
            hitSlop={8}
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={bookmarked ? colors.accent : colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setSheet({ type: "note", ayah: item })}
            hitSlop={8}
          >
            <Ionicons
              name={hasNote ? "document-text" : "document-text-outline"}
              size={18}
              color={hasNote ? colors.accent : colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.playBtn, { backgroundColor: isCurrentlyPlaying ? colors.primary : colors.secondary }]}
            onPress={() => handlePlay(item)}
            hitSlop={8}
          >
            <Ionicons
              name={isCurrentlyPlaying ? "pause" : "play"}
              size={16}
              color={isCurrentlyPlaying ? "#fff" : colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [colors, arabicFontSize, translationFontSize, settings.language, isBookmarked, getNoteForAyah, nowPlaying, isPlaying, surahNumber, handleBookmark, handlePlay]);

  const renderHeader = () => {
    if (!data) return null;
    const { surahMeta } = data;
    return (
      <View style={[styles.surahHeader, { backgroundColor: colors.primary }]}>
        <Text style={styles.surahArabicName}>{surahMeta.name}</Text>
        <Text style={styles.surahEnglishName}>{surahMeta.englishName}</Text>
        <Text style={styles.surahMeta}>
          {surahMeta.englishNameTranslation} · {surahMeta.revelationType} · {surahMeta.numberOfAyahs} verses
        </Text>
        {surahNumber !== 1 && surahNumber !== 9 && (
          <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading surah...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="wifi-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.foreground }]}>Failed to load surah</Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={data.ayahs}
        keyExtractor={(item) => String(item.numberInSurah)}
        renderItem={renderAyah}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: Platform.OS === "web" ? 84 : 100,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        initialNumToRender={8}
      />

      <View style={styles.playerWrapper}>
        <AudioPlayerBar />
      </View>

      {sheet.type === "word" && sheet.ayah && (
        <WordAnalysisSheet
          visible
          surah={surahNumber}
          ayah={sheet.ayah.numberInSurah}
          arabicText={sheet.ayah.arabic}
          onClose={closeSheet}
        />
      )}

      {sheet.type === "tafseer" && sheet.ayah && (
        <TafseerSheet
          visible
          surah={surahNumber}
          ayah={sheet.ayah.numberInSurah}
          arabicText={sheet.ayah.arabic}
          onClose={closeSheet}
        />
      )}

      {sheet.type === "note" && sheet.ayah && data && (
        <NoteModal
          visible
          surahName={data.surahMeta.englishName}
          ayahNumber={sheet.ayah.numberInSurah}
          initialContent={getNoteForAyah(surahNumber, sheet.ayah.numberInSurah)?.content ?? ""}
          onSave={(content) => {
            if (!sheet.ayah || !data) return;
            addNote({
              surahNumber,
              surahName: data.surahMeta.englishName,
              ayahNumber: sheet.ayah.numberInSurah,
              arabic: sheet.ayah.arabic,
              content,
            });
          }}
          onDelete={() => {
            const note = getNoteForAyah(surahNumber, sheet.ayah!.numberInSurah);
            if (note) deleteNote(note.id);
          }}
          onClose={closeSheet}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  errorText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 },
  surahHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    marginTop: 8,
    gap: 6,
  },
  surahArabicName: { fontSize: 36, color: "#fff", textAlign: "center" },
  surahEnglishName: { fontSize: 22, color: "#fff", fontFamily: "Inter_700Bold" },
  surahMeta: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" },
  bismillah: { fontSize: 20, color: "#c9a227", marginTop: 12, textAlign: "center" },
  ayahCard: {
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  ayahHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  ayahNumBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  ayahNumText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  metaBadges: { flexDirection: "row", gap: 6 },
  metaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  metaBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  arabicText: {
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 48,
    fontFamily: "Inter_400Regular",
  },
  translationText: {
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    fontStyle: "italic",
  },
  urduText: {
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 28,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 4,
  },
  actionBtn: { flex: 1, alignItems: "center", paddingVertical: 4, borderRadius: 8 },
  playBtn: { width: 32, height: 32, flex: 0, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  playerWrapper: { position: "absolute", bottom: 0, left: 0, right: 0 },
});
