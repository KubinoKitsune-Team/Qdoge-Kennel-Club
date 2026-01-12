import { atom } from "jotai";
import type { Trade } from "@/types";

export const tradesAtom = atom<Trade[]>([]);
