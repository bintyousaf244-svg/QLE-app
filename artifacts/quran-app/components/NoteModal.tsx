import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  initialContent?: string;
  surahName: string;
  ayahNumber: number;
  onSave: (content: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function NoteModal({ visible, initialContent = "", surahName, ayahNumber, onSave, onDelete, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (visible) setContent(initialContent);
  }, [visible, initialContent]);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>Note</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {surahName} · Ayah {ayahNumber}
              </Text>
            </View>
            <View style={styles.headerActions}>
              {onDelete && initialContent && (
                <TouchableOpacity onPress={() => { onDelete(); onClose(); }} hitSlop={10} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={18} color={colors.destructive} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholder="Write your notes here..."
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: content.trim() ? 1 : 0.5 }]}
              onPress={handleSave}
              disabled={!content.trim()}
            >
              <Feather name="check" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Save Note</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 12 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  deleteBtn: { padding: 4 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  input: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, minHeight: 140, marginBottom: 16 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14, marginBottom: 8 },
  saveBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
