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
import type { SearchResult } from "@/types";
import { THEMES } from "@/types";

type SearchMode = "keyword" | "root" | "thematic";

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>("keyword");
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ["search", activeQuery],
    queryFn: () => searchQuran(activeQuery),
    enabled: activeQuery.trim().length > 1,
    staleTime: 60000,
  });

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
          <Text style={[styles.refText, { color: colors.primaryForeground }]}>
            {item.surah.number}:{item.numberInSurah}
          </Text>
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.modeTabs}>
        {(["keyword", "root", "thematic"] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeTab, { borderBottomColor: mode === m ? colors.primary : "transparent" }]}
            onPress={() => { setMode(m); setQuery(""); setActiveQuery(""); }}
          >
            <Text style={[styles.modeText, { color: mode === m ? colors.primary : colors.mutedForeground }]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(mode === "keyword" || mode === "root") && (
        <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder={mode === "root" ? "Enter Arabic root (e.g. كتب)" : "Search in English..."}
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
      )}

      {mode === "thematic" && (
        <ScrollView
          style={styles.themeScroll}
          contentContainerStyle={[styles.themeGrid, { paddingBottom: Platform.OS === "web" ? 84 : 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.themeTitle, { color: colors.foreground }]}>Explore Topics</Text>
          <Text style={[styles.themeSubtitle, { color: colors.mutedForeground }]}>
            Browse the Quran by theme
          </Text>
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

      {(mode === "keyword" || mode === "root") && (
        <>
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
              <Ionicons name={mode === "root" ? "language-outline" : "search-outline"} size={48} color={colors.mutedForeground} />
              <Text style={[styles.promptTitle, { color: colors.foreground }]}>
                {mode === "root" ? "Root Word Search" : "Keyword Search"}
              </Text>
              <Text style={[styles.promptSub, { color: colors.mutedForeground }]}>
                {mode === "root"
                  ? "Enter an Arabic root to find related verses"
                  : "Search the Quran by English keywords"}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modeTabs: { flexDirection: "row", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e2ddd0" },
  modeTab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2 },
  modeText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  searchRow: { flexDirection: "row", gap: 8, padding: 16, alignItems: "center" },
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
  promptCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
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
});
