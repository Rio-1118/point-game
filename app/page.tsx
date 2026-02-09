"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { watchAuthAndRole, type Role } from "@/lib/role";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const unsub = watchAuthAndRole(
      (user, role) => {
        setEmail(user.email ?? "");
        setRole(role);
        setLoading(false);
      },
      () => router.replace("/login"),
      () => router.replace("/login")
    );
    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <main style={{ padding: 24, fontSize: 20, fontWeight: 700 }}>
        読み込み中…
      </main>
    );
  }

  const isEditor = role === "editor" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#0b1220",
        color: "#fff",
        fontSize: 20,
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontSize: 34, marginBottom: 10 }}>🌳 ポイントの木</h1>

      <div
        style={{
          border: "2px solid #888",
          borderRadius: 12,
          padding: 16,
          background: "#111",
          marginBottom: 16,
        }}
      >
        <div><b>ログイン:</b> {email || "（メール不明）"}</div>
        <div>
          <b>あなたの権限:</b>{" "}
          {role === "viewer" ? "閲覧者" : role === "editor" ? "入力者" : "管理者"}
        </div>

        <button
          onClick={async () => {
            await signOut(auth);
            router.replace("/login");
          }}
          style={{
            marginTop: 14,
            padding: "12px 16px",
            borderRadius: 10,
            border: "2px solid #fff",
            background: "#000",
            color: "#fff",
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          ログアウト
        </button>
      </div>

      {/* みんな共通：閲覧エリア */}
      <div style={cardStyle}>
        <h2 style={h2Style}>👀 閲覧（みんなOK）</h2>
        <p>ポイントの合計や履歴を見るページ（これから作る）</p>

        <Link style={linkBtnStyle} href="/view">
          閲覧ページへ
        </Link>
      </div>

      {/* 入力者以上だけ：入力エリア */}
      {isEditor ? (
        <div style={cardStyle}>
          <h2 style={h2Style}>✍️ 入力（入力者/管理者のみ）</h2>
          <p>加点・減点と理由を登録するページ</p>

          <Link style={linkBtnStyle} href="/entry">
            入力ページへ
          </Link>
        </div>
      ) : (
        <div style={cardStyle}>
          <h2 style={h2Style}>✍️ 入力</h2>
          <p style={{ fontWeight: 800 }}>
            あなたは「閲覧者」なので、入力はできません。
          </p>
        </div>
      )}

      {/* 管理者だけ：管理エリア */}
      {isAdmin && (
        <div style={cardStyle}>
          <h2 style={h2Style}>👑 管理（管理者のみ）</h2>
          <p>ユーザーの権限変更</p>
          <Link style={linkBtnStyle} href="/admin">
            管理者画面へ
          </Link>
        </div>
      )}
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  border: "2px solid #888",
  borderRadius: 12,
  padding: 16,
  background: "#111",
  marginBottom: 16,
};

const h2Style: React.CSSProperties = {
  fontSize: 26,
  margin: "0 0 8px 0",
};

const linkBtnStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 10,
  padding: "12px 16px",
  borderRadius: 10,
  border: "2px solid #fff",
  background: "#fff",
  color: "#000",
  fontWeight: 900,
  textDecoration: "none",
};
