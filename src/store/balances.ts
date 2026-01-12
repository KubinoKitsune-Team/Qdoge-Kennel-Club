import { Balance } from "@/types";
import { atom } from "jotai";

export const balancesAtom = atom<Balance[]>([]);
