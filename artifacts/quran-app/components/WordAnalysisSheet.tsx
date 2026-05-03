import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { fetchWordAnalysis } from "@/services/quranService";
import type { WordAnalysis } from "@/types";

interface Props {
  visible: boolean;
  surah: number;
  ayah: number;
  arabicText: string;
  onClose: () => void;
}

export function WordAnalysisSheet({ visible, surah, ayah, arabicText, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: words, isLoading, isError } = useQuery({
    queryKey: ["wordAnalysis", surah, ayah],
    queryFn: () => fetchWordAnalysis(surah, ayah),
    enabled: visible,
  });

  const renderWord = ({ item, index }: { item: WordAnalysis; index: number }) => (
    <View style={[styles.wordItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.wordHeader}>
        <View style={[styles.positionBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.positionText, { color: colors.primaryForeground }]}>{index + 1}</Text>
        </View>
      </View>
      <Text style={[styles.arabicWord, { color: colors.accent }]}>{item.text_uthmani}</Text>
      {item.transliteration?.text && (
        <Text style={[styles.transliteration, { color: colors.mutedForeground }]}>{item.transliteration.text}</Text>
      )}
      {item.translation?.text && (
        <Text style={[styles.wordTranslation, { color: colors.foreground }]}>{item.translation.text}</Text>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Word Analysis</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.fullArabic, { color: colors.accent }]} textBreakStrategy="simple">
            {arabicText}
          </Text>

          <Text style={[styles.surahRef, { color: colors.mutedForeground }]}>
            {surah}:{ayah} — Tap a word to explore
          </Text>

          {isLoading && (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading word analysis...</Text>
            </View>
          )}

          {isError && (
            <View style={styles.loading}>
              <Feather name="alert-circle" size={20} color={colors.destructive} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Could not load word data.</Text>
            </View>
          )}

          {words && (
            <FlatList
              data={words}
              keyExtractor={(item) => `${item.id}-${item.position}`}
              renderItem={renderWord}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wordList}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 12, maxHeight: "75%" },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  fullArabic: { fontSize: 24, textAlign: "right", fontFamily: "Inter_400Regular", lineHeight: 40, marginBottom: 4, writingDirection: "rtl" },
  surahRef: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 16 },
  loading: { alignItems: "center", gap: 8, paddingVertical: 24 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  wordList: { paddingRight: 16, gap: 10, paddingBottom: 16 },
  wordItem: { width: 140, borderRadius: 12, padding: 12, borderWidth: 1, gap: 4 },
  wordHeader: { alignItems: "flex-end" },
  positionBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  positionText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  arabicWord: { fontSize: 22, textAlign: "center", marginVertical: 4 },
  transliteration: { fontSize: 12, textAlign: "center", fontFamily: "Inter_400Regular", fontStyle: "italic" },
  wordTranslation: { fontSize: 12, textAlign: "center", fontFamily: "Inter_500Medium" },
});
