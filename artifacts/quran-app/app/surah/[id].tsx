import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AnalysisHub } from "@/components/AnalysisHub";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { DictionarySheet } from "@/components/DictionarySheet";
import { NoteModal } from "@/components/NoteModal";
import { useAudio } from "@/context/AudioContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { fetchSurah } from "@/services/quranService";
import type { AyahData } from "@/types";
import { useRouter as useRouterForSearch } from "expo-router";

interface HubState { ayah: AyahData | null }
interface DictState { word: string; wordIndex: number; ayah: number }
interface NoteState { ayah: AyahData | null }

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahNumber = parseInt(id ?? "1", 10);
  const colors = useColors();
  const { settings, arabicFontSize, translationFontSize } = useSettings();
  const { isBookmarked, addBookmark, removeBookmark, bookmarks, addNote, deleteNote, getNoteForAyah } = useBookmarks();
  const { playAyah, nowPlaying, isPlaying } = useAudio();

  const [hub, setHub] = useState<HubState>({ ayah: null });
  const [dict, setDict] = useState<DictState | null>(null);
  const [noteState, setNoteState] = useState<NoteState>({ ayah: null });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["surah", surahNumber],
    queryFn: () => fetchSurah(surahNumber),
    staleTime: Infinity,
  });

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

  const handleWordTap = useCallback((word: string, wordIndex: number, ayahNum: number) => {
    const clean = word.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0640]/g, "");
    if (clean.trim().length < 2) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDict({ word: clean.trim(), wordIndex, ayah: ayahNum });
  }, []);

  const renderAyah = useCallback(({ item }: { item: AyahData }) => {
    const bookmarked = isBookmarked(surahNumber, item.numberInSurah);
    const hasNote = !!getNoteForAyah(surahNumber, item.numberInSurah);
    const isCurrentlyPlaying =
      nowPlaying?.surahNumber === surahNumber &&
      nowPlaying?.ayahNumber === item.numberInSurah &&
      isPlaying;

    const arabicWords = item.arabic.split(" ");

    return (
      <View style={[styles.ayahCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.ayahHeader}>
          <View style={[styles.ayahNumBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.ayahNumText, { color: "#fff" }]}>{item.numberInSurah}</Text>
          </View>
          <View style={styles.metaRow}>
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
            {hasNote && (
              <View style={[styles.metaBadge, { backgroundColor: colors.accent + "20" }]}>
                <Ionicons name="document-text" size={10} color={colors.accent} />
              </View>
            )}
          </View>
        </View>

        {/* Tappable Arabic words */}
        <View style={styles.arabicRow}>
          {arabicWords.map((word, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleWordTap(word, i, item.numberInSurah)}
              activeOpacity={0.6}
              style={styles.arabicWordBtn}
            >
              <Text style={[styles.arabicWord, { color: colors.foreground, fontSize: arabicFontSize }]}>
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
            style={[styles.actionBtn, isCurrentlyPlaying && { backgroundColor: colors.primary, borderRadius: 8 }]}
            onPress={() => handlePlay(item)}
            hitSlop={6}
          >
            <Ionicons
              name={isCurrentlyPlaying ? "pause" : "play"}
              size={18}
              color={isCurrentlyPlaying ? "#fff" : colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => handleBookmark(item)} hitSlop={6}>
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={bookmarked ? colors.accent : colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setNoteState({ ayah: item })} hitSlop={6}>
            <Ionicons
              name={hasNote ? "document-text" : "document-text-outline"}
              size={18}
              color={hasNote ? colors.accent : colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.analysisBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setHub({ ayah: item });
            }}
          >
            <Ionicons name="flask-outline" size={14} color="#fff" />
            <Text style={styles.analysisBtnText}>Analyse</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [colors, arabicFontSize, translationFontSize, settings.language, isBookmarked, getNoteForAyah, nowPlaying, isPlaying, surahNumber, handleBookmark, handlePlay, handleWordTap]);

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
        <View style={styles.tapHint}>
          <Ionicons name="finger-print-outline" size={12} color="rgba(255,255,255,0.6)" />
          <Text style={styles.tapHintText}>Tap any word for dictionary</Text>
        </View>
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
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: Platform.OS === "web" ? 84 : 120 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        initialNumToRender={6}
      />

      <View style={styles.playerWrapper}>
        <AudioPlayerBar />
      </View>

      {/* Analysis Hub */}
      {hub.ayah && data && (
        <AnalysisHub
          visible={!!hub.ayah}
          surah={surahNumber}
          ayah={hub.ayah.numberInSurah}
          arabicText={hub.ayah.arabic}
          surahName={data.surahMeta.englishName}
          onClose={() => setHub({ ayah: null })}
        />
      )}

      {/* Dictionary Sheet */}
      {dict && (
        <DictionarySheet
          visible={!!dict}
          word={dict.word}
          surah={surahNumber}
          ayah={dict.ayah}
          wordIndex={dict.wordIndex}
          onClose={() => setDict(null)}
          onRootSearch={(root) => {
            setDict(null);
          }}
        />
      )}

      {/* Note Modal */}
      {noteState.ayah && data && (
        <NoteModal
          visible={!!noteState.ayah}
          surahName={data.surahMeta.englishName}
          ayahNumber={noteState.ayah.numberInSurah}
          initialContent={getNoteForAyah(surahNumber, noteState.ayah.numberInSurah)?.content ?? ""}
          onSave={(content) => {
            if (!noteState.ayah || !data) return;
            addNote({
              surahNumber,
              surahName: data.surahMeta.englishName,
              ayahNumber: noteState.ayah.numberInSurah,
              arabic: noteState.ayah.arabic,
              content,
            });
          }}
          onDelete={() => {
            const note = getNoteForAyah(surahNumber, noteState.ayah!.numberInSurah);
            if (note) deleteNote(note.id);
          }}
          onClose={() => setNoteState({ ayah: null })}
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
    alignItems: "center", paddingVertical: 28, paddingHorizontal: 20,
    marginBottom: 8, borderRadius: 16, marginTop: 8, gap: 5,
  },
  surahArabicName: { fontSize: 34, color: "#fff", textAlign: "center" },
  surahEnglishName: { fontSize: 20, color: "#fff", fontFamily: "Inter_700Bold" },
  surahMeta: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" },
  bismillah: { fontSize: 18, color: "#c9a227", marginTop: 10, textAlign: "center" },
  tapHint: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8, opacity: 0.7 },
  tapHintText: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
  ayahCard: {
    borderRadius: 14, padding: 14, marginVertical: 5, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  ayahHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  ayahNumBadge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  ayahNumText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  metaRow: { flexDirection: "row", gap: 5, flex: 1 },
  metaBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  metaBadgeText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  arabicRow: {
    flexDirection: "row-reverse", flexWrap: "wrap", gap: 2, marginBottom: 10,
    justifyContent: "flex-start",
  },
  arabicWordBtn: { padding: 2 },
  arabicWord: { lineHeight: 46, fontFamily: "Inter_400Regular" },
  translationText: { fontFamily: "Inter_400Regular", lineHeight: 22, fontStyle: "italic", marginBottom: 8 },
  urduText: { textAlign: "right", writingDirection: "rtl", lineHeight: 28, fontFamily: "Inter_400Regular", fontStyle: "italic", marginBottom: 8 },
  actions: { flexDirection: "row", alignItems: "center", paddingTop: 10, borderTopWidth: 1, gap: 4 },
  actionBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  analysisBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 7, borderRadius: 8, marginLeft: 4,
  },
  analysisBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  playerWrapper: { position: "absolute", bottom: 0, left: 0, right: 0 },
});
