import { create } from "zustand";

interface SettingsState {
  theme: "light" | "dark" | "system";
  enterToSend: boolean;
  showTimestamps: boolean;
  streamResponses: boolean;
  autoPlayVoice: boolean;
  voiceSpeed: number;

  setTheme: (theme: "light" | "dark" | "system") => void;
  setEnterToSend: (enabled: boolean) => void;
  setShowTimestamps: (enabled: boolean) => void;
  setStreamResponses: (enabled: boolean) => void;
  setAutoPlayVoice: (enabled: boolean) => void;
  setVoiceSpeed: (speed: number) => void;
}

const SETTINGS_KEY = "ava_settings";

function getInitialSettings(): Partial<SettingsState> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initial = getInitialSettings();

  return {
    theme: initial.theme || "dark",
    enterToSend: initial.enterToSend ?? true,
    showTimestamps: initial.showTimestamps ?? true,
    streamResponses: initial.streamResponses ?? true,
    autoPlayVoice: initial.autoPlayVoice ?? false,
    voiceSpeed: initial.voiceSpeed ?? 1.0,

    setTheme: (theme) => {
      set({ theme });
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), theme }));
      }
    },

    setEnterToSend: (enterToSend) => {
      set({ enterToSend });
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), enterToSend }));
      }
    },

    setShowTimestamps: (showTimestamps) => {
      set({ showTimestamps });
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), showTimestamps }));
      }
    },

    setStreamResponses: (streamResponses) => {
      set({ streamResponses });
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), streamResponses }));
      }
    },

    setAutoPlayVoice: (autoPlayVoice) => {
      set({ autoPlayVoice });
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), autoPlayVoice }));
      }
    },

    setVoiceSpeed: (voiceSpeed) => {
      set({ voiceSpeed });
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), voiceSpeed }));
      }
    },
  };
});
