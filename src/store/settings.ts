import { DEFAULT_TICK_OFFSET } from "@/constants";
import { atom } from "jotai";
import { THEME_LIST } from "@/constants";

export type Settings = {
  tickOffset: number;
  darkMode: boolean;
  notifications: boolean;
  theme: (typeof THEME_LIST)[number]["value"];
};

const localStorageSettings = JSON.parse(
  localStorage.getItem("settings") ||
    `{"tickOffset": ${DEFAULT_TICK_OFFSET},"darkMode": true,"notifications": false,"theme": "${THEME_LIST[0].value}"}`,
) as Settings;

export const settingsAtom = atom(
  localStorageSettings || {
    tickOffset: DEFAULT_TICK_OFFSET,
    darkMode: true,
    notifications: false,
    theme: THEME_LIST[0].value,
  },
  (get, set, update: Partial<Settings>) => {
    const newSettings = { ...get(settingsAtom), ...update };
    set(settingsAtom, newSettings);
    localStorage.setItem("settings", JSON.stringify(newSettings));
  },
);
