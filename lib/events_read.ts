import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type EventRow = {
  id: string;
  delta: number;
  eventDate: string;
  reasonLabel: string;
  note?: string;
  createdBy: string;
  createdByName?: string;
};

export async function fetchEvents(): Promise<EventRow[]> {
  const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      delta: Number(data.delta ?? 0),
      eventDate: String(data.eventDate ?? ""),
      reasonLabel: String(data.reasonLabel ?? ""),
      note: String(data.note ?? ""),
      createdBy: String(data.createdBy ?? ""),
      createdByName: String(data.createdByName ?? ""),
    };
  });
}
