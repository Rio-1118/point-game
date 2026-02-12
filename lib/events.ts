"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type EventInput = {
  date: string;           // YYYY-MM-DD
  delta: number;          // + / -
  reasonId?: string;      // 理由ID
  reasonLabel?: string;   // 理由ラベル
  note?: string;          // 自由入力
  createdBy: string;      // UID
  createdByName?: string; // PN
};

export async function createEvent(input: EventInput) {
  const payload = {
    date: input.date,
    delta: input.delta,

    reasonId: input.reasonId ?? null,
    reasonLabel: input.reasonLabel ?? null,

    note: input.note ?? "",

    createdBy: input.createdBy,
    createdByName: input.createdByName ?? null,

    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "events"), payload);
}
