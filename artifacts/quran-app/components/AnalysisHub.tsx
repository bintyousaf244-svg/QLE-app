import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { fetchWordAnalysis, fetchTafseer } from "@/services/quranService";
import {
  fetchGrammar,
  fetchMorphology,
  fetchTafseerFromApi,
  type TafseerAyah,
} from "@/services/apiService";
import type { WordAnalysis } from "@/types";

type Tab = "words" | "grammar" | "morphology" | "tafseer";
type TafseerEdition = "maududi" | "kathir" | "maarif";

const TABS: { id: Tab; label: string; arabic: string }[] = [
  { id: "words", label: "Words", arabic: "كلمات" },
  { id: "grammar", label: "Grammar", arabic: "إعراب" },
  { id: "morphology", label: "Morphology", arabic: "صرف" },
  { id: "tafseer", label: "Tafseer", arabic: "تفسير" },
];

const TAFSEER_EDITIONS = [
  { id: "maududi" as TafseerEdition, label: "Maududi", lang: "EN" },
  { id: "kathir" as TafseerEdition, label: "Ibn Kathir", lang: "EN" },
  { id: "maarif" as TafseerEdition, label: "Maariful Quran", lang: "UR" },
];

interface Props {
  visible: boolean;
  surah: number;
  ayah: number;
  arabicText: string;
  surahName: string;
  onClose: () => void;
}

function LoadingState({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.centered}>
      <Ionicons name="alert-circle-outline" size={36} color={colors.destructive} />
      <Text style={[styles.errorTitle, { color: colors.foreground }]}>Failed to load</Text>
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={onRetry}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function WordCard({ item, index, colors }: { item: WordAnalysis; index: number; colors: any }) {
  return (
    <View style={[styles.wordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.wordPos, { backgroundColor: colors.primary }]}>
        <Text style={[styles.wordPosText, { color: "#fff" }]}>{index + 1}</Text>
      </View>
      <Text style={[styles.wordArabic, { color: colors.accent }]}>{item.text_uthmani}</Text>
      {item.transliteration?.text && (
        <Text style={[styles.wordTranslit, { color: colors.mutedForeground }]}>{item.transliteration.text}</Text>
      )}
      {item.translation?.text && (
        <Text style={[styles.wordMeaning, { color: colors.foreground }]}>{item.translation.text}</Text>
      )}
    </View>
  );
}

function AnalysisText({ text, colors }: { text: string; colors: any }) {
  const lines = text.split("\n");
  return (
    <View style={styles.analysisContainer}>
      {lines.map((line, i) => {
        if (!line.trim()) return <View key={i} style={styles.lineGap} />;
        const isArabic = /[\u0600-\u06FF]/.test(line) && line.replace(/[^\u0600-\u06FF\s﴿﴾]/g, "").length > line.length * 0.3;
        const isBold = line.startsWith("**") && line.endsWith("**") && line.length > 4;
        const isHeading = line.startsWith("---");
        if (isHeading) {
          return <View key={i} style={[styles.divider, { backgroundColor: colors.border }]} />;
        }
        const cleanLine = isBold ? line.slice(2, -2) : line.replace(/\*\*/g, "");
        return (
          <Text
            key={i}
            style={[
              styles.analysisLine,
              { color: colors.foreground },
              isArabic && styles.arabicLine,
              isBold && styles.boldLine,
            ]}
            textBreakStrategy="simple"
          >
            {cleanLine}
          </Text>
        );
      })}
    </View>
  );
}

export function AnalysisHub({ visible, surah, ayah, arabicText, surahName, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("words");
  const [tafseerEdition, setTafseerEdition] = useState<TafseerEdition>("maududi");

  const wordsQuery = useQuery<WordAnalysis[]>({
    queryKey: ["wordAnalysis", surah, ayah],
    queryFn: () => fetchWordAnalysis(surah, ayah),
    enabled: visible && activeTab === "words",
    staleTime: Infinity,
  });

  const grammarQuery = useQuery({
    queryKey: ["grammar", surah, ayah],
    queryFn: () => fetchGrammar(surah, ayah),
    enabled: visible && activeTab === "grammar",
    staleTime: Infinity,
  });

  const morphologyQuery = useQuery({
    queryKey: ["morphology", surah, ayah],
    queryFn: () => fetchMorphology(arabicText, surahName, ayah),
    enabled: visible && activeTab === "morphology",
    staleTime: Infinity,
  });

  const maududiQuery = useQuery({
    queryKey: ["tafseer-maududi", surah, ayah],
    queryFn: () => fetchTafseer(surah, ayah),
    enabled: visible && activeTab === "tafseer" && tafseerEdition === "maududi",
    staleTime: Infinity,
  });

  const kathirQuery = useQuery<TafseerAyah[]>({
    queryKey: ["tafseer-kathir", surah],
    queryFn: () => fetchTafseerFromApi(surah, "en.kathir"),
    enabled: visible && activeTab === "tafseer" && tafseerEdition === "kathir",
    staleTime: Infinity,
  });

  const maarifQuery = useQuery<TafseerAyah[]>({
    queryKey: ["tafseer-maarif", surah],
    queryFn: () => fetchTafseerFromApi(surah, "ur.maarifulquran"),
    enabled: visible && activeTab === "tafseer" && tafseerEdition === "maarif",
    staleTime: Infinity,
  });

  const renderWordsTab = () => {
    if (wordsQuery.isLoading) return <LoadingState text="Loading word analysis..." />;
    if (wordsQuery.isError) return <ErrorState message="Could not load word data." onRetry={() => wordsQuery.refetch()} />;
    if (!wordsQuery.data?.length) return <ErrorState message="No word data available." />;
    return (
      <FlatList
        data={wordsQuery.data}
        keyExtractor={(item) => `${item.id}-${item.position}`}
        renderItem={({ item, index }) => <WordCard item={item} index={index} colors={colors} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.wordList}
      />
    );
  };

  const renderGrammarTab = () => {
    if (grammarQuery.isLoading) return <LoadingState text="Loading grammar analysis..." />;
    if (grammarQuery.isError) return <ErrorState message="Grammar service unavailable." onRetry={() => grammarQuery.refetch()} />;
    if (!grammarQuery.data?.data) {
      return (
        <View style={styles.centered}>
          <Ionicons name="book-outline" size={36} color={colors.mutedForeground} />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>No grammar data found for this verse.</Text>
        </View>
      );
    }
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {grammarQuery.data.sourceLabel && (
          <View style={[styles.sourceBadge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="library-outline" size={12} color={colors.primary} />
            <Text style={[styles.sourceLabel, { color: colors.primary }]}>{grammarQuery.data.sourceLabel}</Text>
          </View>
        )}
        <AnalysisText text={grammarQuery.data.data} colors={colors} />
      </ScrollView>
    );
  };

  const renderMorphologyTab = () => {
    if (morphologyQuery.isLoading) return <LoadingState text="Analyzing morphology with AI..." />;
    if (morphologyQuery.isError) {
      return (
        <ErrorState
          message="AI analysis unavailable. This feature requires an API key."
          onRetry={() => morphologyQuery.refetch()}
        />
      );
    }
    if (!morphologyQuery.data) return <ErrorState message="No morphology data." />;
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        <View style={[styles.sourceBadge, { backgroundColor: colors.secondary }]}>
          <Ionicons name="sparkles-outline" size={12} color={colors.primary} />
          <Text style={[styles.sourceLabel, { color: colors.primary }]}>AI Analysis · Classical Arabic Morphology</Text>
        </View>
        <AnalysisText text={morphologyQuery.data} colors={colors} />
      </ScrollView>
    );
  };

  const renderTafseerTab = () => {
    const activeQuery = tafseerEdition === "maududi" ? maududiQuery : tafseerEdition === "kathir" ? kathirQuery : maarifQuery;
    const isLoading = activeQuery.isLoading;
    const isError = activeQuery.isError;

    let tafseerText = "";
    if (tafseerEdition === "maududi" && maududiQuery.data) {
      tafseerText = maududiQuery.data as string;
    } else if (tafseerEdition === "kathir" && kathirQuery.data) {
      const match = (kathirQuery.data as TafseerAyah[]).find((a) => a.numberInSurah === ayah);
      tafseerText = match?.text ?? "";
    } else if (tafseerEdition === "maarif" && maarifQuery.data) {
      const match = (maarifQuery.data as TafseerAyah[]).find((a) => a.numberInSurah === ayah);
      tafseerText = match?.text ?? "";
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        <View style={styles.editionRow}>
          {TAFSEER_EDITIONS.map((ed) => (
            <TouchableOpacity
              key={ed.id}
              style={[
                styles.editionChip,
                {
                  backgroundColor: tafseerEdition === ed.id ? colors.primary : colors.card,
                  borderColor: tafseerEdition === ed.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setTafseerEdition(ed.id)}
            >
              <Text style={[styles.editionLabel, { color: tafseerEdition === ed.id ? "#fff" : colors.foreground }]}>
                {ed.label}
              </Text>
              <View style={[styles.langBadge, { backgroundColor: tafseerEdition === ed.id ? "rgba(255,255,255,0.2)" : colors.secondary }]}>
                <Text style={[styles.langText, { color: tafseerEdition === ed.id ? "#fff" : colors.primary }]}>{ed.lang}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading && <LoadingState text="Loading tafseer..." />}
        {isError && <ErrorState message="Tafseer service unavailable." onRetry={() => activeQuery.refetch()} />}
        {!isLoading && !isError && !tafseerText && (
          <View style={styles.centered}>
            <Ionicons name="book-outline" size={36} color={colors.mutedForeground} />
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>No tafseer available for this verse.</Text>
          </View>
        )}
        {tafseerText ? (
          <Text
            style={[
              styles.tafseerText,
              { color: colors.foreground },
              tafseerEdition === "maarif" && styles.urduText,
            ]}
          >
            {tafseerText}
          </Text>
        ) : null}
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Platform.OS === "ios" ? insets.top : 16 }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Analysis</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {surahName} · {surah}:{ayah}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
            <Feather name="x" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={[styles.arabicBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.arabicPreview, { color: colors.accent }]} textBreakStrategy="simple">
            {arabicText}
          </Text>
        </View>

        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, { borderBottomColor: activeTab === tab.id ? colors.primary : "transparent" }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabLabel, { color: activeTab === tab.id ? colors.primary : colors.mutedForeground }]}>
                {tab.label}
              </Text>
              <Text style={[styles.tabArabic, { color: activeTab === tab.id ? colors.accent : colors.mutedForeground }]}>
                {tab.arabic}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent2}>
          {activeTab === "words" ? renderWordsTab() : null}
          {activeTab === "grammar" ? renderGrammarTab() : null}
          {activeTab === "morphology" ? renderMorphologyTab() : null}
          {activeTab === "tafseer" ? renderTafseerTab() : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn: { padding: 4 },
  arabicBox: { marginHorizontal: 16, marginVertical: 10, borderRadius: 12, padding: 14, borderWidth: 1 },
  arabicPreview: { fontSize: 22, textAlign: "right", lineHeight: 38, writingDirection: "rtl" },
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderBottomWidth: 2, gap: 2 },
  tabLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  tabArabic: { fontSize: 13 },
  tabContent2: { flex: 1 },
  tabContent: { padding: 16, paddingBottom: 40 },
  centered: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24, gap: 10 },
  hint: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  errorTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, marginTop: 4 },
  retryBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  wordList: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 10 },
  wordCard: { width: 150, borderRadius: 14, padding: 14, borderWidth: 1, gap: 6, alignItems: "center" },
  wordPos: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  wordPosText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  wordArabic: { fontSize: 24, textAlign: "center", marginVertical: 2 },
  wordTranslit: { fontSize: 11, fontFamily: "Inter_400Regular", fontStyle: "italic", textAlign: "center" },
  wordMeaning: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  sourceBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 14 },
  sourceLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  analysisContainer: { gap: 2 },
  analysisLine: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 24 },
  arabicLine: { textAlign: "right", writingDirection: "rtl", fontSize: 16, lineHeight: 30 },
  boldLine: { fontFamily: "Inter_700Bold", color: "#1a6b4a" },
  lineGap: { height: 8 },
  divider: { height: 1, marginVertical: 12 },
  editionRow: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  editionChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  editionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  langBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  langText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  tafseerText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 26 },
  urduText: { textAlign: "right", writingDirection: "rtl", lineHeight: 30, fontSize: 16 },
});
