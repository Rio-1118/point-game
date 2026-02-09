import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Goal = {
  id: string;
  point: number;
  label: string;
};

export async function fetchGoals(): Promise<Goal[]> {
  const q = query(collection(db, "goals"), orderBy("point", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map(d => ({
    id: d.id,
    point: Number(d.data().point),
    label: String(d.data().label),
  }));
}
