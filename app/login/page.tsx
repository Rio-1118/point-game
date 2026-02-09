"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUser } from "@/lib/user";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const r = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");
    try {
      let cred;
      if (mode === "login") {
        cred = await signInWithEmailAndPassword(auth, email, pw);
      } else {
        cred = await createUserWithEmailAndPassword(auth, email, pw);
      }

      // Firestore に users/{uid} を作る
      await ensureUser(cred.user.uid, cred.user.email);

      r.push("/");
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-gradient-to-b from-yellow-50 to-pink-50">
      <div className="max-w-md w-full rounded-3xl p-6 shadow-xl border bg-white">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-extrabold">
            {mode === "login" ? "🔐 ログイン" : "🆕 新規登録"}
          </h1>
          <Link href="/">戻る</Link>
        </div>

        <div className="mt-4 grid gap-3">
          <input
            className="border rounded-2xl px-4 py-3 text-lg"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border rounded-2xl px-4 py-3 text-lg"
            type="password"
            placeholder="パスワード"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />

          {msg && <p className="text-red-600">{msg}</p>}

          <button
            className="rounded-2xl px-4 py-3 text-lg font-bold bg-black text-white"
            onClick={submit}
          >
            {mode === "login" ? "ログイン" : "登録"}
          </button>

          <button
            className="rounded-2xl px-4 py-3 text-lg border"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "新規登録はこちら" : "ログインはこちら"}
          </button>
        </div>
      </div>
    </main>
  );
}
