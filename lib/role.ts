import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type Role = "viewer" | "editor" | "admin";

export function watchAuthAndRole(
  onReady: (user: User, role: Role) => void,
  onNoUser: () => void,
  onError: (msg: string) => void
) {
  return onAuthStateChanged(auth, async (user) => {
    try {
      if (!user) return onNoUser();

      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        return onError(`users/${user.uid} がありません（Firestoreにユーザーがありません）`);
      }

      const role = snap.data().role as Role;
      onReady(user, role);
    } catch (e: any) {
      onError(e?.message ?? String(e));
    }
  });
}
