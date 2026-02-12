import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type EventInput = {
  date: string;               // "2026-02-10" など
  delta: number;              // +10 / -5 など
  reasonPreset: string;       // 選択理由
  reasonFree?: string;        // 自由入力（任意）
  createdByUid: string;       // ★必須
  createdByName?: string;     // ★PN（任意）
};

export async function createEvent(input: EventInput) {
  await addDoc(collection(db, "events"), {
    ...input,
    createdAt: serverTimestamp(), // 並び替え用
  });
}
