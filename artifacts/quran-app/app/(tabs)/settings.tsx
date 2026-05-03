import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { clearAllCache, getCacheStats } from "@/services/offlineCache";
import type { FontSize, Language } from "@/types";

const RECITERS = [
  { id: "alafasy", name: "Sheikh Alafasy" },
  { id: "minshawi", name: "Al-Minshawi" },
  { id: "husary", name: "Al-Husary" },
  { id: "sudais", name: "Abdul Basit" },
];

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return <Text style={[styles.sectionHeader, { color: colors.primary }]}>{title}</Text>;
}

function Row({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

function OptionChips<T extends string>({
  options,
  value,
  onChange,
  getLabel,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  getLabel: (v: T) => string;
}) {
  const colors = useColors();
  return (
    <View style={styles.chips}>
      {options.map((o) => (
        <TouchableOpacity
          key={o}
          style={[
            styles.chip,
            {
              backgroundColor: value === o ? colors.primary : colors.card,
              borderColor: value === o ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onChange(o)}
        >
          <Text style={[styles.chipText, { color: value === o ? colors.primaryForeground : colors.foreground }]}>
            {getLabel(o)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const { settings, setLanguage, setFontSize, toggleTransliteration, setReciter } = useSettings();
  const { isOnline } = useNetworkStatus();
  const [cacheStats, setCacheStats] = useState<{ count: number; sizeKb: number } | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    getCacheStats().then(setCacheStats);
  }, []);

  const handleClearCache = () => {
    Alert.alert(
      "Clear Offline Cache",
      "This will remove all cached Quran data. Content will be re-downloaded next time you open a surah.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Cache",
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            await clearAllCache();
            const stats = await getCacheStats();
            setCacheStats(stats);
            setClearing(false);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 84 : 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="DISPLAY" />

        <Row label="Language" icon="language-outline">
          <OptionChips<Language>
            options={["en", "ur"]}
            value={settings.language}
            onChange={setLanguage}
            getLabel={(v) => (v === "en" ? "English" : "اردو")}
          />
        </Row>

        <Row label="Font Size" icon="text-outline">
          <OptionChips<FontSize>
            options={["small", "medium", "large"]}
            value={settings.fontSize}
            onChange={setFontSize}
            getLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
          />
        </Row>

        <View style={[styles.row, { borderBottomColor: "transparent" }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="text" size={18} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Transliteration</Text>
          </View>
          <Switch
            value={settings.showTransliteration}
            onValueChange={toggleTransliteration}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="AUDIO" />
        <Text style={[styles.reciterLabel, { color: colors.mutedForeground }]}>Reciter</Text>
        {RECITERS.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[
              styles.reciterRow,
              { borderColor: colors.border, backgroundColor: settings.reciter === r.id ? colors.secondary : "transparent" },
            ]}
            onPress={() => setReciter(r.id)}
          >
            <View style={[styles.radio, { borderColor: settings.reciter === r.id ? colors.primary : colors.border }]}>
              {settings.reciter === r.id && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={[styles.reciterName, { color: colors.foreground }]}>{r.name}</Text>
            {settings.reciter === r.id && <Feather name="check" size={16} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="OFFLINE & CACHE" />

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <Ionicons name={isOnline ? "wifi-outline" : "wifi-outline"} size={18} color={isOnline ? "#16a34a" : "#dc2626"} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Network Status</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isOnline ? "#dcfce7" : "#fee2e2" }]}>
            <Text style={[styles.statusText, { color: isOnline ? "#16a34a" : "#dc2626" }]}>
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="archive-outline" size={18} color={colors.primary} />
            <View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Cached Content</Text>
              {cacheStats && (
                <Text style={[styles.cacheDetail, { color: colors.mutedForeground }]}>
                  {cacheStats.count} item{cacheStats.count !== 1 ? "s" : ""} · {cacheStats.sizeKb} KB
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.row, { borderBottomColor: "transparent" }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Auto-cache</Text>
          </View>
          <Text style={[styles.cacheDetail, { color: colors.mutedForeground }]}>Always on</Text>
        </View>

        <TouchableOpacity
          style={[styles.clearBtn, { borderColor: "#dc2626", opacity: clearing || (cacheStats?.count === 0) ? 0.4 : 1 }]}
          onPress={handleClearCache}
          disabled={clearing || cacheStats?.count === 0}
        >
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
          <Text style={styles.clearBtnText}>{clearing ? "Clearing..." : "Clear Cache"}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="ABOUT" />
        <View style={styles.aboutSection}>
          <Text style={[styles.aboutTitle, { color: colors.foreground }]}>Quranic Linguistic Explorer</Text>
          <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>
            A comprehensive tool for exploring the Quran with word-by-word analysis, root word search, thematic exploration, and multilingual support.
          </Text>
          <Text style={[styles.aboutSub, { color: colors.mutedForeground }]}>
            Data from AlQuran.cloud API & Quran.com
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  cacheDetail: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  clearBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginVertical: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  clearBtnText: { color: "#dc2626", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  card: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, overflow: "hidden" },
  sectionHeader: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1, paddingTop: 16, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  chips: { flexDirection: "row", gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  reciterLabel: { fontSize: 13, fontFamily: "Inter_400Regular", paddingBottom: 8 },
  reciterRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 8, marginBottom: 4 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  reciterName: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  aboutSection: { paddingVertical: 16, gap: 6 },
  aboutTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  aboutText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  aboutSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
});
