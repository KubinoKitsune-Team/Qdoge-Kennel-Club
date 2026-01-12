import { atom } from "jotai";

export interface OrderbookSettings {
  showCumulativeVolume: boolean;
  maxItems: number;
  groupingSize: number;
}

const localStorageSettings = JSON.parse(
  localStorage.getItem("orderbookSettings") || `{"showCumulativeVolume": false,"maxItems": 15,"groupingSize": 0}`,
) as OrderbookSettings;

export const orderbookSettingsAtom = atom(
  localStorageSettings || {
    showCumulativeVolume: false,
    maxItems: 15,
    groupingSize: 0,
  },
  (get, set, update: Partial<OrderbookSettings>) => {
    const newSettings = { ...get(orderbookSettingsAtom), ...update };
    set(orderbookSettingsAtom, newSettings);
    localStorage.setItem("orderbookSettings", JSON.stringify(newSettings));
  },
);
