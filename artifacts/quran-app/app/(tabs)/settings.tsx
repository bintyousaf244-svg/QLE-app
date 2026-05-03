import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
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
