"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { watchAuthAndRole, type Role } from "@/lib/role";
import { db } from "@/lib/firebase";

import {
  PopShell,
  PopCard,
  PopButton,
  PopInput,
  PopPill,
} from "@/components/PopUI";

type UserRow = {
  uid: string;
  email: string | null;
  role: Role;
  name: string | null; // PN
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [savingUid, setSavingUid] = useState<string>("");

  // adminガード + 一覧ロード
  useEffect(() => {
    const unsub = watchAuthAndRole(
      async (info) => {
        if (info.role !== "admin") {
          router.replace("/");
          return;
        }

        setRole(info.role);
        setLoading(false);
        await loadUsers();
      },
      () => router.replace("/login")
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadUsers() {
    setMsg("");
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: UserRow[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          uid: d.id,
          email: data.email ?? null,
          role: (data.role ?? "viewer") as Role,
          name: data.name ?? null,
        };
      });

      // 表示を安定させる（email順）
      list.sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
      setUsers(list);
    } catch (e: any) {
      setMsg(`❌ users一覧を取得できません: ${e?.message ?? e}`);
    }
  }

  async function changeRole(uid: string, nextRole: Role) {
    setMsg("");
    setSavingUid(uid);
    try {
      await updateDoc(doc(db, "users", uid), { role: nextRole });
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: nextRole } : u)));
      setMsg("✅ 役割を更新しました");
    } catch (e: any) {
      setMsg(`❌ 役割更新に失敗: ${e?.message ?? e}`);
    } finally {
      setSavingUid("");
    }
  }

  async function savePN(uid: string, pn: string) {
    const trimmed = pn.trim();
    setMsg("");
    setSavingUid(uid);
    try {
      await updateDoc(doc(db, "users", uid), { name: trimmed.length ? trimmed : null });
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, name: trimmed.length ? trimmed : null } : u)));
      setMsg("✅ PN を更新しました");
    } catch (e: any) {
      setMsg(`❌ PN更新に失敗: ${e?.message ?? e}`);
    } finally {
      setSavingUid("");
    }
  }

  if (loading) {
    return (
      <PopShell>
        <PopCard icon="⏳" title="確認中…">少し待ってね</PopCard>
      </PopShell>
    );
  }

  // roleがadmin以外は弾いてるけど、画面としても出しておく
  if (role !== "admin") {
    return (
      <PopShell>
        <PopCard icon="⛔" title="権限がありません">
          admin だけが入れます
          <div style={{ marginTop: 12 }}>
            <PopButton variant="ghost" onClick={() => router.push("/")}>戻る</PopButton>
          </div>
        </PopCard>
      </PopShell>
    );
  }

  return (
    <PopShell>
      <PopCard icon="⚙️" title="管理者画面">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <PopPill>adminのみ</PopPill>
          <PopButton variant="ghost" onClick={loadUsers}>最新に更新</PopButton>
          <PopButton variant="ghost" onClick={() => router.push("/")}>ホームへ</PopButton>
        </div>
      </PopCard>

      {msg ? (
        <PopCard icon={msg.startsWith("✅") ? "✅" : "⚠️"} title="メッセージ">
          <div style={{ fontWeight: 900 }}>{msg}</div>
        </PopCard>
      ) : null}

      <PopCard icon="👥" title="ユーザー管理（役割 / PN）">
        {users.length === 0 ? (
          <div>ユーザーがまだいません（ログインすると users が作られます）</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {users.map((u) => (
              <div
                key={u.uid}
                style={{
                  border: "1px solid rgba(0,0,0,0.15)",
                  borderRadius: 14,
                  padding: 12,
                  background: "rgba(255,255,255,0.8)",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {u.email ?? "（emailなし）"}
                </div>

                <div style={{ marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <PopPill>UID: {u.uid}</PopPill>
                  <PopPill>現在: {u.role}</PopPill>
                  <PopPill>PN: {u.name ?? "（未設定）"}</PopPill>
                </div>

                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  {/* 役割変更 */}
                  <div style={{ fontWeight: 900 }}>役割を変更</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <PopButton
                      variant={u.role === "viewer" ? "primary" : "ghost"}
                      disabled={savingUid === u.uid}
                      onClick={() => changeRole(u.uid, "viewer")}
                    >
                      閲覧者
                    </PopButton>
                    <PopButton
                      variant={u.role === "editor" ? "primary" : "ghost"}
                      disabled={savingUid === u.uid}
                      onClick={() => changeRole(u.uid, "editor")}
                    >
                      入力者
                    </PopButton>
                    <PopButton
                      variant={u.role === "admin" ? "primary" : "ghost"}
                      disabled={savingUid === u.uid}
                      onClick={() => changeRole(u.uid, "admin")}
                    >
                      管理者
                    </PopButton>
                  </div>

                  {/* PN変更 */}
                  <div style={{ fontWeight: 900, marginTop: 6 }}>PN を変更</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <PopInput
                      value={u.name ?? ""}
                      placeholder="例：りお / たろう / みき など"
                      onChange={(e) => {
                        const v = e.target.value;
                        setUsers((prev) =>
                          prev.map((x) => (x.uid === u.uid ? { ...x, name: v } : x))
                        );
                      }}
                    />
                    <PopButton
                      disabled={savingUid === u.uid}
                      onClick={() => savePN(u.uid, u.name ?? "")}
                    >
                      保存
                    </PopButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PopCard>
    </PopShell>
  );
}
