"use client";

import { collection, getDocs, limit as qLimit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type EventRow = {
  id: string;
  date: string; // YYYY-MM-DD
  delta: number;

  reasonId?: string | null;
  reasonLabel?: string | null;
  note?: string;

  createdBy: string;
  createdByName?: string | null;

  // Firestore Timestamp でも Date でも来る可能性があるので any 扱いで安全に
  createdAt?: any;
};

export async function fetchEvents(max: number = 200): Promise<EventRow[]> {
  const q = query(
    collection(db, "events"),
    orderBy("createdAt", "desc"),
    qLimit(max)
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as any;

    return {
      id: d.id,
      date: String(data.date ?? ""),
      delta: Number(data.delta ?? 0),

      reasonId: data.reasonId ?? null,
      reasonLabel: data.reasonLabel ?? null,
      note: String(data.note ?? ""),

      createdBy: String(data.createdBy ?? ""),
      createdByName: data.createdByName ?? null,

      createdAt: data.createdAt,
    };
  });
}
