import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "@qle/";

export const TTL = {
  surahList:  30 * 24 * 60 * 60 * 1000,
  surah:      30 * 24 * 60 * 60 * 1000,
  grammar:     7 * 24 * 60 * 60 * 1000,
  wordLookup: 90 * 24 * 60 * 60 * 1000,
  tafseer:    30 * 24 * 60 * 60 * 1000,
  wordAnalysis: 30 * 24 * 60 * 60 * 1000,
};

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number;
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.cachedAt > entry.ttl) {
      void AsyncStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttl: number): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl };
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {}
}

export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const qleKeys = keys.filter((k) => k.startsWith(PREFIX));
    if (qleKeys.length > 0) await AsyncStorage.multiRemove(qleKeys);
  } catch {}
}

export async function getCacheStats(): Promise<{ count: number; sizeKb: number }> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const qleKeys = keys.filter((k) => k.startsWith(PREFIX));
    let totalSize = 0;
    for (const k of qleKeys) {
      const v = await AsyncStorage.getItem(k);
      if (v) totalSize += v.length;
    }
    return { count: qleKeys.length, sizeKb: Math.round(totalSize / 1024) };
  } catch {
    return { count: 0, sizeKb: 0 };
  }
}
