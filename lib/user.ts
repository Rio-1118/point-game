import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function ensureUser(uid: string, email: string | null) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: email ?? "未設定",
      email,
      role: "viewer", // 最初は必ず viewer
      createdAt: serverTimestamp(),
    });
  }
}
