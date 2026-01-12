import { Asset } from "@/types";
import { atom } from "jotai";

export const assetsAtom = atom<Asset[]>([]);
