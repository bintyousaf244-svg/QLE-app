import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface Props {
  fromCache?: boolean;
}

export function OfflineBanner({ fromCache = false }: Props) {
  const { isOnline } = useNetworkStatus();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const show = !isOnline || fromCache;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: show ? 1 : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [show, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });

  if (!show) return null;

  const bgColor = !isOnline ? "#dc2626" : "#d97706";
  const icon = !isOnline ? "wifi-outline" : "cloud-outline";
  const message = !isOnline
    ? "No internet — showing cached content"
    : "Showing cached content";

  return (
    <Animated.View
      style={[styles.banner, { backgroundColor: bgColor, transform: [{ translateY }] }]}
    >
      <Ionicons name={icon} size={13} color="#fff" />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
