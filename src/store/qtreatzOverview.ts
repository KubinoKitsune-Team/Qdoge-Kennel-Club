import { atom } from "jotai";
import type { QTreatzOverview } from "@/services/backend.service";

export const qtreatzOverviewAtom = atom<QTreatzOverview | null>(null);
