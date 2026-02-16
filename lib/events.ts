"use client";

import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type EventInput = {
  delta: number;          // +10 / -5 みたいな増減
  date: string;           // "YYYY-MM-DD"
  reasonLabel: string;    // 表示用の理由（例：お手伝いした）
  note?: string;          // 自由入力
  createdBy: string;      // uid
  createdByName: string;  // PN
};

export async function createEvent(input: EventInput) {
  await addDoc(collection(db, "events"), {
    ...input,
    note: input.note ?? "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateEvent(
  id: string,
  patch: Partial<Pick<EventInput, "delta" | "date" | "reasonLabel" | "note">>
) {
  await updateDoc(doc(db, "events", id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
