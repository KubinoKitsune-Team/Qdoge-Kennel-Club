import { atom } from "jotai";
import { TickInfo } from "@/types";

export const tickInfoAtom = atom<TickInfo>({} as TickInfo);
