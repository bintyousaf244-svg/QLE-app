import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { searchQuran } from "@/services/quranService";
import { fetchTasreef, type TasreefResult, type TasreefForm } from "@/services/apiService";
import type { SearchResult } from "@/types";
import { THEMES } from "@/types";

type SearchMode = "keyword" | "root" | "thematic" | "tasreef";

function TasreefTable({ forms, title, colors, columns }: {
  forms: TasreefForm[];
  title: string;
  colors: any;
  columns: string[];
}) {
  if (!forms?.length) return null;
  return (
    <View style={[tasreefStyles.section, { borderColor: colors.border }]}>
      <Text style={[tasreefStyles.sectionTitle, { color: colors.primary, backgroundColor: colors.secondary }]}>
        {title}
      </Text>
      <View style={[tasreefStyles.tableHeader, { backgroundColor: colors.secondary }]}>
        <Text style={[tasreefStyles.th, { color: colors.mutedForeground, flex: 1.5 }]}>Pronoun</Text>
        {columns.map((c) => (
          <Text key={c} style={[tasreefStyles.th, { color: colors.mutedForeground }]}>{c}</Text>
        ))}
      </View>
      {forms.map((form, i) => (
        <View
          key={i}
          style={[
            tasreefStyles.tableRow,
            { borderBottomColor: colors.border, backgroundColor: i % 2 === 0 ? "transparent" : colors.card },
          ]}
        >
          <View style={{ flex: 1.5 }}>
            <Text style={[tasreefStyles.pronoun, { color: colors.accent }]}>{form.pronoun}</Text>
            <Text style={[tasreefStyles.pronounEn, { color: colors.mutedForeground }]}>{form.pronounEn}</Text>
          </View>
          {columns.includes("Maloom") && (
            <View style={tasreefStyles.formCell}>
              <Text style={[tasreefStyles.formArabic, { color: colors.foreground }]}>{form.maloom ?? "—"}</Text>
              {form.maloomTranslit && <Text style={[tasreefStyles.formTranslit, { color: colors.mutedForeground }]}>{form.maloomTranslit}</Text>}
            </View>
          )}
          {columns.includes("Majhool") && (
            <View style={tasreefStyles.formCell}>
              <Text style={[tasreefStyles.formArabic, { color: colors.foreground }]}>{form.majhool ?? "—"}</Text>
              {form.majhoolTranslit && <Text style={[tasreefStyles.formTranslit, { color: colors.mutedForeground }]}>{form.majhoolTranslit}</Text>}
            </View>
          )}
          {columns.includes("Marfu") && (
            <View style={tasreefStyles.formCell}>
              <Text style={[tasreefStyles.formArabic, { color: colors.foreground }]}>{form.marfu ?? "—"}</Text>
              {form.marfuTranslit && <Text style={[tasreefStyles.formTranslit, { color: colors.mutedForeground }]}>{form.marfuTranslit}</Text>}
            </View>
          )}
          {columns.includes("Mansub") && (
            <View style={tasreefStyles.formCell}>
              <Text style={[tasreefStyles.formArabic, { color: colors.foreground }]}>{form.mansub ?? "—"}</Text>
              {form.mansubTranslit && <Text style={[tasreefStyles.formTranslit, { color: colors.mutedForeground }]}>{form.mansubTranslit}</Text>}
            </View>
          )}
          {columns.includes("Form") && (
            <View style={tasreefStyles.formCell}>
              <Text style={[tasreefStyles.formArabic, { color: colors.foreground }]}>{form.form ?? "—"}</Text>
              {form.translit && <Text style={[tasreefStyles.formTranslit, { color: colors.mutedForeground }]}>{form.translit}</Text>}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function TasreefResult({ data, colors }: { data: TasreefResult; colors: any }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tasreefStyles.resultScroll}>
      {/* Header Card */}
      <View style={[tasreefStyles.headerCard, { backgroundColor: colors.primary }]}>
        <Text style={tasreefStyles.verbRoot}>{data.root ?? "—"}</Text>
        <Text style={tasreefStyles.verbForm}>{data.verbForm ?? ""}</Text>
        <Text style={tasreefStyles.verbMeaning}>{data.meaning ?? ""}</Text>
        {data.chapter && <Text style={tasreefStyles.verbChapter}>{data.chapter}</Text>}
        {data.type && <Text style={tasreefStyles.verbType}>{data.type}</Text>}
      </View>

      {/* Derived Forms */}
      {(data.masdar || data.ismFail || data.ismMaful || data.ismMakan) && (
        <View style={[tasreefStyles.section, { borderColor: colors.border }]}>
          <Text style={[tasreefStyles.sectionTitle, { color: colors.primary, backgroundColor: colors.secondary }]}>
            Derived Forms (المشتقات)
          </Text>
          <View style={tasreefStyles.derivedGrid}>
            {[
              { label: "مَصْدَر (Masdar)", value: data.masdar },
              { label: "اسم فاعل (Doer)", value: data.ismFail },
              { label: "اسم مفعول (Done to)", value: data.ismMaful },
              { label: "اسم مكان (Place)", value: data.ismMakan },
            ].filter((d) => d.value && d.value !== "null").map((d) => (
              <View key={d.label} style={[tasreefStyles.derivedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[tasreefStyles.derivedLabel, { color: colors.mutedForeground }]}>{d.label}</Text>
                <Text style={[tasreefStyles.derivedValue, { color: colors.accent }]}>{d.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {data.madi && <TasreefTable forms={data.madi} title="الفعل الماضي (Past Tense)" colors={colors} columns={["Maloom", "Majhool"]} />}
      {data.mudari && <TasreefTable forms={data.mudari} title="الفعل المضارع (Present Tense)" colors={colors} columns={["Marfu", "Mansub"]} />}
      {data.amr && <TasreefTable forms={data.amr} title="فعل الأمر (Imperative)" colors={colors} columns={["Form"]} />}
    </ScrollView>
  );
}

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>("keyword");
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [tasreefQuery, setTasreefQuery] = useState("");
  const [activeTasreef, setActiveTasreef] = useState("");

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ["search", activeQuery],
    queryFn: () => searchQuran(activeQuery),
    enabled: activeQuery.trim().length > 1 && (mode === "keyword" || mode === "root"),
    staleTime: 60000,
  });

  const { data: tasreefData, isLoading: tasreefLoading, isError: tasreefError, refetch: refetchTasreef } = useQuery({
    queryKey: ["tasreef", activeTasreef],
    queryFn: () => fetchTasreef(activeTasreef),
    enabled: activeTasreef.trim().length > 0,
    staleTime: Infinity,
    retry: 1,
  });

  const EXAMPLE_VERBS = ["كَتَبَ", "قَالَ", "ذَهَبَ", "آمَنَ", "عَلِمَ", "نَصَرَ", "هَدَى", "صَبَرَ", "دَعَا", "سَمِعَ"];

  const handleSearch = () => {
    if (query.trim().length > 1) setActiveQuery(query.trim());
  };

  const handleThemeSelect = (keywords: string[]) => {
    const q = keywords[0];
    setQuery(q);
    setActiveQuery(q);
    setMode("keyword");
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/surah/${item.surah.number}`)}
      activeOpacity={0.7}
    >
      <View style={styles.resultHeader}>
        <View style={[styles.refBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.refText, { color: "#fff" }]}>{item.surah.number}:{item.numberInSurah}</Text>
        </View>
        <Text style={[styles.surahName, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.surah.englishName}
        </Text>
      </View>
      <Text style={[styles.resultText, { color: colors.foreground }]} numberOfLines={3}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  const TABS: { id: SearchMode; label: string; icon: string }[] = [
    { id: "keyword", label: "Keyword", icon: "search" },
    { id: "root", label: "Root", icon: "git-branch" },
    { id: "thematic", label: "Themes", icon: "grid" },
    { id: "tasreef", label: "Tasreef", icon: "layers" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.modeTabs, { borderBottomColor: colors.border }]}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.modeTab, { borderBottomColor: mode === t.id ? colors.primary : "transparent" }]}
            onPress={() => { setMode(t.id); setQuery(""); setActiveQuery(""); }}
          >
            <Feather name={t.icon as any} size={13} color={mode === t.id ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.modeText, { color: mode === t.id ? colors.primary : colors.mutedForeground }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Keyword / Root Search */}
      {(mode === "keyword" || mode === "root") && (
        <>
          <View style={styles.searchRow}>
            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder={mode === "root" ? "Enter Arabic root (e.g. كتب ر ح م)" : "Search in English..."}
                placeholderTextColor={colors.mutedForeground}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => { setQuery(""); setActiveQuery(""); }} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.searchBtn, { backgroundColor: colors.primary, opacity: query.trim().length > 1 ? 1 : 0.5 }]}
              onPress={handleSearch}
              disabled={query.trim().length < 2}
            >
              <Feather name="search" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {(isLoading || isFetching) && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Searching...</Text>
            </View>
          )}

          {results && !isFetching && (
            <FlatList
              data={results}
              keyExtractor={(item, i) => `${item.number}-${i}`}
              renderItem={renderResult}
              ListHeaderComponent={
                <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
                  {results.length} result{results.length !== 1 ? "s" : ""} for "{activeQuery}"
                </Text>
              }
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="search-outline" size={40} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results found</Text>
                  <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Try different keywords</Text>
                </View>
              }
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Platform.OS === "web" ? 84 : 100 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          {!activeQuery && !isLoading && (
            <View style={styles.promptCenter}>
              <Ionicons
                name={mode === "root" ? "language-outline" : "search-outline"}
                size={48}
                color={colors.mutedForeground}
              />
              <Text style={[styles.promptTitle, { color: colors.foreground }]}>
                {mode === "root" ? "Root Word Search" : "Keyword Search"}
              </Text>
              <Text style={[styles.promptSub, { color: colors.mutedForeground }]}>
                {mode === "root"
                  ? "Enter Arabic letters to find all occurrences and derivatives"
                  : "Search the Quran by English keywords or phrases"}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Thematic Search */}
      {mode === "thematic" && (
        <ScrollView
          style={styles.themeScroll}
          contentContainerStyle={[styles.themeGrid, { paddingBottom: Platform.OS === "web" ? 84 : 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.themeTitle, { color: colors.foreground }]}>Explore Topics</Text>
          <Text style={[styles.themeSubtitle, { color: colors.mutedForeground }]}>Browse the Quran by theme</Text>
          {Object.entries(THEMES).map(([theme, keywords]) => (
            <TouchableOpacity
              key={theme}
              style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleThemeSelect(keywords)}
              activeOpacity={0.7}
            >
              <View style={[styles.themeIconBox, { backgroundColor: colors.secondary }]}>
                <Ionicons name="book-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.themeInfo}>
                <Text style={[styles.themeName, { color: colors.foreground }]}>{theme}</Text>
                <Text style={[styles.themeKeywords, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {keywords.slice(0, 3).join(" · ")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Tasreef */}
      {mode === "tasreef" && (
        <View style={styles.tasreefContainer}>
          <View style={styles.tasreefInputSection}>
            <View style={[styles.tasreefHeader, { backgroundColor: colors.secondary }]}>
              <View style={[styles.tasreefIconBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.tasreefIconText}>ص</Text>
              </View>
              <View>
                <Text style={[styles.tasreefTitle, { color: colors.foreground }]}>تصريف الأفعال</Text>
                <Text style={[styles.tasreefSubtitle, { color: colors.mutedForeground }]}>Verb Conjugation Table</Text>
              </View>
            </View>

            <View style={styles.tasreefSearchRow}>
              <TextInput
                style={[styles.tasreefInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="اكتب الفعل (مثل: كتب، يكتب، نصر)..."
                placeholderTextColor={colors.mutedForeground}
                value={tasreefQuery}
                onChangeText={setTasreefQuery}
                onSubmitEditing={() => { if (tasreefQuery.trim()) setActiveTasreef(tasreefQuery.trim()); }}
                returnKeyType="search"
                textAlign="right"
              />
              <TouchableOpacity
                style={[styles.searchBtn, { backgroundColor: colors.primary, opacity: tasreefQuery.trim().length > 0 ? 1 : 0.5 }]}
                onPress={() => { if (tasreefQuery.trim()) setActiveTasreef(tasreefQuery.trim()); }}
                disabled={!tasreefQuery.trim()}
              >
                <Feather name="search" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.examplesRow}>
              {EXAMPLE_VERBS.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.exampleChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => { setTasreefQuery(v); setActiveTasreef(v); }}
                >
                  <Text style={[styles.exampleText, { color: colors.accent }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.tasreefResult}>
            {tasreefLoading && (
              <View style={styles.promptCenter}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.promptSub, { color: colors.mutedForeground }]}>Generating conjugation table...</Text>
              </View>
            )}
            {tasreefError && (
              <View style={styles.promptCenter}>
                <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
                <Text style={[styles.promptTitle, { color: colors.foreground }]}>Tasreef Unavailable</Text>
                <Text style={[styles.promptSub, { color: colors.mutedForeground }]}>
                  This feature requires the AI API key to be configured on the server.
                </Text>
                <TouchableOpacity
                  style={[styles.searchBtn, { backgroundColor: colors.primary, marginTop: 8 }]}
                  onPress={() => refetchTasreef()}
                >
                  <Feather name="refresh-cw" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            {tasreefData && !tasreefLoading && (
              <TasreefResult data={tasreefData} colors={colors} />
            )}
            {!activeTasreef && !tasreefLoading && (
              <View style={styles.promptCenter}>
                <Text style={styles.tasreefPromptArabic}>تصريف</Text>
                <Text style={[styles.promptTitle, { color: colors.foreground }]}>Verb Conjugation</Text>
                <Text style={[styles.promptSub, { color: colors.mutedForeground }]}>
                  Enter any Arabic verb in any form to see the complete conjugation table with past, present, and imperative forms.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modeTabs: { flexDirection: "row", borderBottomWidth: 1 },
  modeTab: { flex: 1, flexDirection: "column", alignItems: "center", paddingVertical: 10, borderBottomWidth: 2, gap: 2 },
  modeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  searchRow: { flexDirection: "row", gap: 8, padding: 14, alignItems: "center" },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  searchBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 16 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  resultCard: { borderRadius: 12, padding: 14, marginVertical: 4, borderWidth: 1, gap: 8 },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  refBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  refText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  surahName: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  resultText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  resultCount: { fontSize: 13, fontFamily: "Inter_400Regular", paddingVertical: 8 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  promptCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32, paddingTop: 40 },
  promptTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  promptSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  themeScroll: { flex: 1 },
  themeGrid: { padding: 16, gap: 10 },
  themeTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  themeSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 4 },
  themeCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  themeIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  themeInfo: { flex: 1 },
  themeName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  themeKeywords: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  tasreefContainer: { flex: 1 },
  tasreefInputSection: { padding: 14, gap: 10 },
  tasreefHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12 },
  tasreefIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  tasreefIconText: { fontSize: 20, color: "#fff" },
  tasreefTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  tasreefSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  tasreefSearchRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  tasreefInput: { flex: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 18 },
  examplesRow: { gap: 8, paddingHorizontal: 2 },
  exampleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  exampleText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  tasreefResult: { flex: 1 },
  tasreefPromptArabic: { fontSize: 40, color: "#c9a227" },
});

const tasreefStyles = StyleSheet.create({
  resultScroll: { padding: 14, paddingBottom: Platform.OS === "web" ? 84 : 100, gap: 12 },
  headerCard: { borderRadius: 16, padding: 20, alignItems: "center", gap: 4 },
  verbRoot: { fontSize: 28, color: "#c9a227", textAlign: "center" },
  verbForm: { fontSize: 16, color: "rgba(255,255,255,0.85)", textAlign: "center" },
  verbMeaning: { fontSize: 14, color: "#fff", fontFamily: "Inter_600SemiBold" },
  verbChapter: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  verbType: { fontSize: 11, color: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  section: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.5, paddingHorizontal: 14, paddingVertical: 8 },
  tableHeader: { flexDirection: "row", paddingHorizontal: 14, paddingVertical: 6 },
  th: { flex: 1, fontSize: 10, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  tableRow: { flexDirection: "row", paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1 },
  pronoun: { fontSize: 14, textAlign: "center" },
  pronounEn: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  formCell: { flex: 1, alignItems: "center" },
  formArabic: { fontSize: 13, textAlign: "center" },
  formTranslit: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center", fontStyle: "italic" },
  derivedGrid: { flexDirection: "row", flexWrap: "wrap", padding: 10, gap: 8 },
  derivedCard: { borderRadius: 10, padding: 10, borderWidth: 1, minWidth: "45%", gap: 4 },
  derivedLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  derivedValue: { fontSize: 16, textAlign: "center" },
});
