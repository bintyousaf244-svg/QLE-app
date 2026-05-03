import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AppSettings, FontSize, Language } from "@/types";

const SETTINGS_KEY = "@quranic_settings";

const defaultSettings: AppSettings = {
  language: "en",
  fontSize: "medium",
  showTransliteration: false,
  reciter: "alafasy",
};

interface SettingsContextType {
  settings: AppSettings;
  setLanguage: (lang: Language) => void;
  setFontSize: (size: FontSize) => void;
  toggleTransliteration: () => void;
  setReciter: (reciter: string) => void;
  arabicFontSize: number;
  translationFontSize: number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((val) => {
      if (val) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(val) });
        } catch {}
      }
    });
  }, []);

  const save = useCallback((updated: AppSettings) => {
    setSettings(updated);
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }, []);

  const setLanguage = useCallback((lang: Language) => save({ ...settings, language: lang }), [settings, save]);
  const setFontSize = useCallback((fontSize: FontSize) => save({ ...settings, fontSize }), [settings, save]);
  const toggleTransliteration = useCallback(() => save({ ...settings, showTransliteration: !settings.showTransliteration }), [settings, save]);
  const setReciter = useCallback((reciter: string) => save({ ...settings, reciter }), [settings, save]);

  const fontSizes = { small: { arabic: 22, translation: 13 }, medium: { arabic: 28, translation: 15 }, large: { arabic: 34, translation: 17 } };
  const sizes = fontSizes[settings.fontSize];

  return (
    <SettingsContext.Provider value={{
      settings, setLanguage, setFontSize, toggleTransliteration, setReciter,
      arabicFontSize: sizes.arabic, translationFontSize: sizes.translation,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
