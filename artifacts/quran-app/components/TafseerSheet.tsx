import { Feather } from "@expo/vector-icons";
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
import { fetchTafseer } from "@/services/quranService";

interface Props {
  visible: boolean;
  surah: number;
  ayah: number;
  arabicText: string;
  onClose: () => void;
}

export function TafseerSheet({ visible, surah, ayah, arabicText, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: tafseer, isLoading, isError } = useQuery({
    queryKey: ["tafseer", surah, ayah],
    queryFn: () => fetchTafseer(surah, ayah),
    enabled: visible,
  });

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>Tafseer</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {surah}:{ayah} · Maududi
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.arabicContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.arabicText, { color: colors.accent }]} textBreakStrategy="simple">
              {arabicText}
            </Text>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {isLoading && (
              <View style={styles.centered}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>Loading tafseer...</Text>
              </View>
            )}
            {isError && (
              <View style={styles.centered}>
                <Feather name="alert-circle" size={20} color={colors.destructive} />
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>Could not load tafseer.</Text>
              </View>
            )}
            {tafseer && (
              <Text style={[styles.tafseerText, { color: colors.foreground }]}>{tafseer}</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 12, maxHeight: "80%" },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  arabicContainer: { borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1 },
  arabicText: { fontSize: 22, textAlign: "right", lineHeight: 38, writingDirection: "rtl" },
  scrollArea: { flex: 1 },
  centered: { alignItems: "center", gap: 8, paddingVertical: 32 },
  hint: { fontSize: 14, fontFamily: "Inter_400Regular" },
  tafseerText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 26, paddingBottom: 24 },
});
