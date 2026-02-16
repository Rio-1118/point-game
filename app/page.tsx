"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { watchAuthAndRole, type Role } from "@/lib/role";

import { PopShell, PopCard, PopButton, PopPill } from "@/components/PopUI";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const unsub = watchAuthAndRole(
      (info) => {
        // ログイン済み
        setEmail(info.email ?? "");
        setRole(info.role);
        setLoading(false);
      },
      () => {
        // 未ログイン
        setEmail("");
        setRole(null);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <PopShell>
        <PopCard icon="⏳" title="読み込み中">
          少し待ってね…
        </PopCard>
      </PopShell>
    );
  }

  return (
    <PopShell>
      <PopCard icon="🏠" title="ポイントゲーム">
        {email ? (
          <>
            <PopPill>ログイン中：{email}</PopPill>
            <PopPill>権限：{role}</PopPill>
          </>
        ) : (
          <PopPill>ログインしていません</PopPill>
        )}
      </PopCard>

      {email ? (
        <>
          {role === "editor" && (
            <PopCard icon="✍️" title="入力">
              <PopButton onClick={() => router.push("/entry")}>
                ポイントを登録する
              </PopButton>
            </PopCard>
          )}

          <PopCard icon="📊" title="閲覧">
            <PopButton onClick={() => router.push("/view")}>
              ポイントを見る
            </PopButton>
          </PopCard>

          {role === "admin" && (
            <PopCard icon="⚙️" title="管理者">
              <PopButton onClick={() => router.push("/admin")}>
                管理者画面
              </PopButton>
            </PopCard>
          )}
        </>
      ) : (
        <PopCard icon="🔐" title="ログイン">
          <PopButton onClick={() => router.push("/login")}>
            ログイン / 新規登録
          </PopButton>
        </PopCard>
      )}
    </PopShell>
  );
}
