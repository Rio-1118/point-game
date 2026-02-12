"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type Role = "admin" | "editor" | "viewer";

export async function getMyRole(): Promise<Role> {
  const u = auth.currentUser;
  if (!u) return "viewer";

  const snap = await getDoc(doc(db, "users", u.uid));
  const role = (snap.exists() ? snap.data().role : "viewer") as Role;
  return role ?? "viewer";
}

export function watchAuthAndRole(
  onReady: (info: { uid: string; email: string | null; role: Role }) => void,
  onNotLoggedIn?: () => void
) {
  return onAuthStateChanged(auth, async (u) => {
    if (!u) {
      onNotLoggedIn?.();
      return;
    }
    const role = await getMyRole();
    onReady({ uid: u.uid, email: u.email, role });
  });
}
