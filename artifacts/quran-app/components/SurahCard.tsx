import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { SurahMeta } from "@/types";
import { URDU_SURAH_NAMES } from "@/services/quranService";
import { useSettings } from "@/context/SettingsContext";

interface Props {
  surah: SurahMeta;
  onPress: () => void;
}

export function SurahCard({ surah, onPress }: Props) {
  const colors = useColors();
  const { settings } = useSettings();

  const displayName = settings.language === "ur"
    ? (URDU_SURAH_NAMES[surah.number] ?? surah.englishName)
    : surah.englishName;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.numberBadge, { backgroundColor: colors.primary }]}>
        <Text style={[styles.numberText, { color: colors.primaryForeground }]}>
          {surah.number}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.englishName, { color: colors.foreground }]} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {surah.revelationType} · {surah.numberOfAyahs} verses
        </Text>
        <Text style={[styles.translation, { color: colors.mutedForeground }]} numberOfLines={1}>
          {surah.englishNameTranslation}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.arabicName, { color: colors.accent }]}>
          {surah.name}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  numberText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  englishName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  translation: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  arabicName: {
    fontSize: 18,
    textAlign: "right",
  },
  chevron: {
    marginTop: 2,
  },
});
