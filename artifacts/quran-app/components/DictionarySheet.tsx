import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { fetchWordLookup, type DictionaryResult } from "@/services/apiService";

interface Props {
  visible: boolean;
  word: string;
  surah: number;
  ayah: number;
  wordIndex: number;
  onClose: () => void;
  onRootSearch?: (root: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  Noun: "#3b82f6",
  Verb: "#8b5cf6",
  Adjective: "#f59e0b",
  Particle: "#10b981",
  Pronoun: "#ef4444",
};

export function DictionarySheet({ visible, word, surah, ayah, wordIndex, onClose, onRootSearch }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError } = useQuery<DictionaryResult>({
    queryKey: ["dictionary", word, surah, ayah, wordIndex],
    queryFn: () => fetchWordLookup(word, surah, ayah, wordIndex),
    enabled: visible && !!word,
    staleTime: Infinity,
  });

  const typeColor = data?.type ? (TYPE_COLORS[data.type] ?? colors.primary) : colors.primary;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.wordLarge, { color: colors.accent }]}>{word}</Text>
              {data?.transliteration && (
                <Text style={[styles.translit, { color: colors.mutedForeground }]}>{data.transliteration}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>Looking up word...</Text>
            </View>
          )}

          {isError && (
            <View style={styles.centered}>
              <Ionicons name="alert-circle-outline" size={28} color={colors.destructive} />
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>Word not found in dictionary</Text>
            </View>
          )}

          {data && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              <View style={styles.chips}>
                {data.root && (
                  <View style={[styles.chip, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>Root</Text>
                    <Text style={[styles.chipValue, { color: colors.primary }]}>{data.root}</Text>
                  </View>
                )}
                {data.wazn && (
                  <View style={[styles.chip, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>Wazn</Text>
                    <Text style={[styles.chipValue, { color: colors.accent }]}>{data.wazn}</Text>
                  </View>
                )}
                {data.type && (
                  <View style={[styles.chip, { backgroundColor: typeColor + "22" }]}>
                    <Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>Type</Text>
                    <Text style={[styles.chipValue, { color: typeColor }]}>{data.type}</Text>
                  </View>
                )}
              </View>

              {data.meaning && (
                <View style={[styles.meaningBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.meaningLabel, { color: colors.mutedForeground }]}>English Meaning</Text>
                  <Text style={[styles.meaningText, { color: colors.foreground }]}>{data.meaning}</Text>
                </View>
              )}

              {data.ar_meaning && (
                <View style={[styles.meaningBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.meaningLabel, { color: colors.mutedForeground }]}>المعنى العربي</Text>
                  <Text style={[styles.meaningArabic, { color: colors.foreground }]}>{data.ar_meaning}</Text>
                </View>
              )}

              {data.source && (
                <Text style={[styles.sourceText, { color: colors.mutedForeground }]}>
                  Source: {data.source === "classical" ? "Classical Arabic Dictionary (Lisan al-Arab)" : data.source}
                </Text>
              )}

              {data.root && onRootSearch && (
                <TouchableOpacity
                  style={[styles.rootSearchBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={() => { onRootSearch(data.root!); onClose(); }}
                >
                  <Ionicons name="search" size={16} color={colors.primary} />
                  <Text style={[styles.rootSearchText, { color: colors.primary }]}>
                    Find "{data.root}" family in Quran
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerLeft: { gap: 4 },
  wordLarge: { fontSize: 36, lineHeight: 48 },
  translit: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  centered: { alignItems: "center", paddingVertical: 32, gap: 8 },
  hint: { fontSize: 14, fontFamily: "Inter_400Regular" },
  scroll: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  chipLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  chipValue: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  meaningBox: { borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, gap: 4 },
  meaningLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  meaningText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  meaningArabic: { fontSize: 16, textAlign: "right", lineHeight: 28, writingDirection: "rtl" },
  sourceText: { fontSize: 11, fontFamily: "Inter_400Regular", fontStyle: "italic", marginBottom: 10 },
  rootSearchBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 16 },
  rootSearchText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
