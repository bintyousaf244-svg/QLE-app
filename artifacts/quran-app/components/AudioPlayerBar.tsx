import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudio } from "@/context/AudioContext";
import { useColors } from "@/hooks/useColors";

export function AudioPlayerBar() {
  const { nowPlaying, isPlaying, isLoading, pauseResume, playNext, playPrev, stop } = useAudio();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  if (!nowPlaying) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary, paddingBottom: insets.bottom + 4 }]}>
      <View style={styles.info}>
        <Text style={styles.surahName} numberOfLines={1}>
          {nowPlaying.surahName}
        </Text>
        <Text style={styles.ayahInfo}>
          Ayah {nowPlaying.ayahNumber} / {nowPlaying.totalAyahs}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrev} style={styles.btn} hitSlop={8}>
          <Feather name="skip-back" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={pauseResume} style={[styles.btn, styles.playBtn]} hitSlop={8}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} style={styles.btn} hitSlop={8}>
          <Feather name="skip-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={stop} style={styles.btn} hitSlop={8}>
          <Feather name="x" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    minHeight: 60,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  surahName: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  ayahInfo: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btn: {
    padding: 6,
  },
  playBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
