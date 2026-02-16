"use client";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Role = "viewer" | "editor" | "admin";

// .env(.local) / Vercel の環境変数に入れる（例: "a@a.com,b@b.com"）
function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;

  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return list.includes(email.toLowerCase());
}

// ログイン/登録時に users/{uid} を必ず作る＆初期roleを決める
export async function ensureUser(uid: string, email: string | null) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  // すでにあるなら何もしない（勝手にrole上書きしない）
  if (snap.exists()) return;

  const role: Role = isAdminEmail(email) ? "admin" : "viewer";

  await setDoc(ref, {
    uid,
    email: email ?? null,
    role,
    name: email ? email.split("@")[0] : "だれか",
    createdAt: serverTimestamp(),
  });
}
