import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OfflineBanner } from "@/components/OfflineBanner";
import { SurahCard } from "@/components/SurahCard";
import { useColors } from "@/hooks/useColors";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineDownload } from "@/hooks/useOfflineDownload";
import { fetchSurahs } from "@/services/quranService";
import type { SurahMeta } from "@/types";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "meccan" | "medinan">("all");
  const { isOnline } = useNetworkStatus();
  const { state: dl, start: startDownload, cancel: cancelDownload } = useOfflineDownload();

  const { data: surahs, isLoading, isError, refetch } = useQuery({
    queryKey: ["surahs"],
    queryFn: fetchSurahs,
    staleTime: Infinity,
  });

  const filtered = useMemo(() => {
    if (!surahs) return [];
    let list = surahs;
    if (filter === "meccan") list = list.filter((s) => s.revelationType === "Meccan");
    if (filter === "medinan") list = list.filter((s) => s.revelationType === "Medinan");
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.englishName.toLowerCase().includes(q) ||
          s.englishNameTranslation.toLowerCase().includes(q) ||
          String(s.number).includes(q) ||
          s.name.includes(query)
      );
    }
    return list;
  }, [surahs, query, filter]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const progressPct = dl.total > 0 ? Math.round((dl.completed / dl.total) * 100) : 0;

  const renderDownloadCard = () => {
    if (dl.status === "done" || dl.alreadyDone) {
      return (
        <View style={[styles.dlCard, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
          <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.dlTitle, { color: "#15803d" }]}>Full Quran Downloaded</Text>
            <Text style={[styles.dlSub, { color: "#4ade80" }]}>All 114 surahs available offline</Text>
          </View>
        </View>
      );
    }

    if (dl.status === "downloading" || dl.status === "checking") {
      return (
        <View style={[styles.dlCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.dlTitle, { color: colors.foreground }]}>
              {dl.status === "checking" ? "Checking cache…" : `Downloading… ${progressPct}%`}
            </Text>
            <Text style={[styles.dlSub, { color: colors.mutedForeground }]}>
              {dl.status === "checking"
                ? "Scanning 114 surahs"
                : `${dl.completed} / ${dl.total} surahs${dl.currentSurah ? ` · Surah ${dl.currentSurah}` : ""}`}
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${progressPct}%` as any, backgroundColor: colors.primary }]} />
            </View>
          </View>
          <TouchableOpacity onPress={cancelDownload} hitSlop={8}>
            <Ionicons name="close-circle-outline" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      );
    }

    if (dl.status === "cancelled") {
      return (
        <View style={[styles.dlCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="cloud-download-outline" size={20} color={colors.mutedForeground} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.dlTitle, { color: colors.foreground }]}>Download Paused</Text>
            <Text style={[styles.dlSub, { color: colors.mutedForeground }]}>{dl.completed} of 114 surahs cached</Text>
          </View>
          <TouchableOpacity
            style={[styles.dlBtn, { backgroundColor: colors.primary }]}
            onPress={startDownload}
          >
            <Text style={styles.dlBtnText}>Resume</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!isOnline) return null;

    return (
      <TouchableOpacity
        style={[styles.dlCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={startDownload}
        activeOpacity={0.8}
      >
        <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.dlTitle, { color: colors.foreground }]}>Download for Offline</Text>
          <Text style={[styles.dlSub, { color: colors.mutedForeground }]}>Save all 114 surahs to your device</Text>
        </View>
        <View style={[styles.dlBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.dlBtnText}>Download</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={[styles.listHeader, { paddingTop: 8 }]}>
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search surahs..."
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {renderDownloadCard()}

      <View style={styles.filters}>
        {(["all", "meccan", "medinan"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              { borderColor: colors.border, backgroundColor: filter === f ? colors.primary : colors.card },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: filter === f ? colors.primaryForeground : colors.mutedForeground }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {surahs && (
        <Text style={[styles.countText, { color: colors.mutedForeground }]}>
          {filtered.length} surah{filtered.length !== 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPadding }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading Quran...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPadding }]}>
        <Ionicons name="wifi-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.errorTitle, { color: colors.foreground }]}>Connection Error</Text>
        <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>Check your internet connection</Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />
      <FlatList
        data={filtered}
        keyExtractor={(item: SurahMeta) => String(item.number)}
        renderItem={({ item }) => (
          <SurahCard surah={item} onPress={() => router.push(`/surah/${item.number}`)} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No surahs found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : 100 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  errorTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  errorSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  retryText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 },
  listHeader: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  filters: { flexDirection: "row", gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  countText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  dlCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dlTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  dlSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  dlBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  dlBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  progressTrack: { height: 4, borderRadius: 2, marginTop: 8, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
});
