import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type EventInput = {
  delta: number;            // +n / -n
  eventDate: string;        // YYYY-MM-DD
  reasonId: string;
  reasonLabel: string;
  note: string;
  createdBy: string;        // uid
  createdByName: string;    // PN（表示名）
};

export async function createEvent(input: EventInput) {
  await addDoc(collection(db, "events"), {
    delta: input.delta,
    eventDate: input.eventDate,
    reasonId: input.reasonId,
    reasonLabel: input.reasonLabel,
    note: input.note,
    createdBy: input.createdBy,
    createdByName: input.createdByName,
    createdAt: serverTimestamp(),
  });
}
