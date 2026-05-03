import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCache, setCache, TTL } from "@/services/offlineCache";
import { fetchSurah } from "@/services/quranService";

const TOTAL_SURAHS = 114;
const DOWNLOAD_FLAG_KEY = "@qle/offline_download_complete";
const DELAY_MS = 350;

export type DownloadStatus = "idle" | "checking" | "downloading" | "done" | "cancelled" | "error";

export interface DownloadState {
  status: DownloadStatus;
  completed: number;
  total: number;
  currentSurah: number | null;
  alreadyDone: boolean;
}

export function useOfflineDownload() {
  const [state, setState] = useState<DownloadState>({
    status: "idle",
    completed: 0,
    total: TOTAL_SURAHS,
    currentSurah: null,
    alreadyDone: false,
  });
  const cancelRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(DOWNLOAD_FLAG_KEY).then((val) => {
      if (val === "1") {
        setState((s) => ({ ...s, alreadyDone: true, status: "done", completed: TOTAL_SURAHS }));
      }
    });
  }, []);

  const start = useCallback(async () => {
    cancelRef.current = false;
    setState({ status: "checking", completed: 0, total: TOTAL_SURAHS, currentSurah: null, alreadyDone: false });

    const missing: number[] = [];
    for (let i = 1; i <= TOTAL_SURAHS; i++) {
      const cached = await getCache(`surah/${i}`);
      if (!cached) missing.push(i);
    }

    if (missing.length === 0) {
      await AsyncStorage.setItem(DOWNLOAD_FLAG_KEY, "1");
      setState({ status: "done", completed: TOTAL_SURAHS, total: TOTAL_SURAHS, currentSurah: null, alreadyDone: true });
      return;
    }

    const alreadyCached = TOTAL_SURAHS - missing.length;
    setState((s) => ({ ...s, status: "downloading", completed: alreadyCached, currentSurah: missing[0] ?? null }));

    let downloaded = alreadyCached;
    for (const surahNum of missing) {
      if (cancelRef.current) {
        setState((s) => ({ ...s, status: "cancelled", currentSurah: null }));
        return;
      }

      setState((s) => ({ ...s, currentSurah: surahNum, completed: downloaded }));

      try {
        await fetchSurah(surahNum);
        downloaded++;
        setState((s) => ({ ...s, completed: downloaded }));
      } catch {
        // skip failed surah and continue
      }

      if (downloaded < TOTAL_SURAHS && !cancelRef.current) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    if (!cancelRef.current) {
      await AsyncStorage.setItem(DOWNLOAD_FLAG_KEY, "1");
      setState({ status: "done", completed: TOTAL_SURAHS, total: TOTAL_SURAHS, currentSurah: null, alreadyDone: true });
    }
  }, []);

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(DOWNLOAD_FLAG_KEY);
    cancelRef.current = false;
    setState({ status: "idle", completed: 0, total: TOTAL_SURAHS, currentSurah: null, alreadyDone: false });
  }, []);

  return { state, start, cancel, reset };
}
