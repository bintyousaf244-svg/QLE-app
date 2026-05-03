import { Audio } from "expo-av";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getAudioUrl } from "@/services/quranService";

interface NowPlaying {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  totalAyahs: number;
  reciter: string;
}

interface AudioContextType {
  nowPlaying: NowPlaying | null;
  isPlaying: boolean;
  isLoading: boolean;
  playAyah: (info: NowPlaying) => Promise<void>;
  pauseResume: () => Promise<void>;
  playNext: () => void;
  playPrev: () => void;
  stop: () => void;
  position: number;
  duration: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const unloadCurrent = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  };

  const playAyah = useCallback(async (info: NowPlaying) => {
    await unloadCurrent();
    setNowPlaying(info);
    setIsLoading(true);
    try {
      const url = getAudioUrl(info.surahNumber, info.ayahNumber, info.reciter);
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis ?? 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish && !status.isLooping) {
              setIsPlaying(false);
            }
          }
        }
      );
      soundRef.current = sound;
    } catch (e) {
      setNowPlaying(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pauseResume = useCallback(async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, [isPlaying]);

  const playNext = useCallback(() => {
    if (!nowPlaying) return;
    if (nowPlaying.ayahNumber < nowPlaying.totalAyahs) {
      playAyah({ ...nowPlaying, ayahNumber: nowPlaying.ayahNumber + 1 });
    }
  }, [nowPlaying, playAyah]);

  const playPrev = useCallback(() => {
    if (!nowPlaying) return;
    if (nowPlaying.ayahNumber > 1) {
      playAyah({ ...nowPlaying, ayahNumber: nowPlaying.ayahNumber - 1 });
    }
  }, [nowPlaying, playAyah]);

  const stop = useCallback(async () => {
    await unloadCurrent();
    setNowPlaying(null);
  }, []);

  return (
    <AudioContext.Provider value={{ nowPlaying, isPlaying, isLoading, playAyah, pauseResume, playNext, playPrev, stop, position, duration }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
