import { atom } from "jotai";
import { LatestStats } from "@/types";

export const latestStatsAtom = atom<LatestStats>({} as LatestStats);
