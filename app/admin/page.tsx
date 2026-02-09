"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  PopShell,
  PopCard,
  PopButton,
  PopInput,
  PopSelect,
  PopPill,
} from "@/components/PopUI";

type Role = "viewer" | "editor" | "admin";

type UserDoc = {
  uid: string;
  email?: string;
  name?: string;
  role: Role;
};

type GoalDoc = {
  id: string;
  point: number;
  label: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [goals, setGoals] = useState<GoalDoc[]>([]);

  const [newGoalLabel, setNewGoalLabel] = useState("");
  const [newGoalPoint, setNewGoalPoint] = useState<number>(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.replace("/login");

      const me = await getDoc(doc(db, "users", user.uid));
      if (!me.exists() || me.data().role !== "admin") {
        return router.replace("/login");
      }

      await refreshAll();
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  async function refreshAll() {
    const userSnap = await getDocs(collection(db, "users"));
    const userList: UserDoc[] = userSnap.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as any),
    }));
    setUsers(userList);

    const goalSnap = await getDocs(
      query(collection(db, "goals"), orderBy("point", "asc"))
    );
    const goalList: GoalDoc[] = goalSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
    setGoals(goalList);
  }

  async function saveUser(uid: string) {
    const u = users.find((x) => x.uid === uid);
    if (!u) return;

    await updateDoc(doc(db, "users", uid), {
      name: u.name ?? "",
      role: u.role,
    });
    alert("保存しました");
  }

  async function addGoal() {
    if (!newGoalLabel || newGoalPoint <= 0) return;

    const ref = await addDoc(collection(db, "goals"), {
      label: newGoalLabel,
      point: newGoalPoint,
    });

    setGoals((prev) =>
      [...prev, { id: ref.id, label: newGoalLabel, point: newGoalPoint }].sort(
        (a, b) => a.point - b.point
      )
    );
    setNewGoalLabel("");
    setNewGoalPoint(0);
  }

  async function saveGoal(id: string) {
    const g = goals.find((x) => x.id === id);
    if (!g) return;

    await updateDoc(doc(db, "goals", id), {
      label: g.label,
      point: g.point,
    });
    alert("保存しました");
  }

  async function removeGoal(id: string) {
    if (!confirm("このゴールを削除しますか？")) return;
    await deleteDoc(doc(db, "goals", id));
    setGoals((prev) => prev.filter((x) => x.id !== id));
  }

  if (loading) {
    return (
      <PopShell>
        <PopCard icon="⏳" title="確認中…">
          ちょっと待ってね
        </PopCard>
      </PopShell>
    );
  }

  return (
    <PopShell>
      <PopCard icon="👑" title="管理者ダッシュボード">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PopPill>ユーザー {users.length} 人</PopPill>
          <PopPill>ゴール {goals.length} 個</PopPill>
        </div>

        <div style={{ marginTop: 12 }}>
          <PopButton
            variant="danger"
            onClick={async () => {
              await signOut(auth);
              router.replace("/login");
            }}
          >
            ログアウト
          </PopButton>
        </div>
      </PopCard>

      <PopCard icon="🎯" title="ゴール管理（追加・編集）">
        <PopInput
          placeholder="ゴール名（例：旅行）"
          value={newGoalLabel}
          onChange={(e) => setNewGoalLabel(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <PopInput
          type="number"
          placeholder="点数"
          value={newGoalPoint}
          onChange={(e) => setNewGoalPoint(Number(e.target.value))}
        />
        <div style={{ height: 8 }} />
        <PopButton onClick={addGoal}>➕ ゴールを追加</PopButton>

        <hr style={{ margin: "16px 0", opacity: 0.2 }} />

        {goals.map((g) => (
          <div key={g.id} style={{ marginBottom: 14 }}>
            <PopInput
              value={g.label}
              onChange={(e) =>
                setGoals((prev) =>
                  prev.map((x) =>
                    x.id === g.id ? { ...x, label: e.target.value } : x
                  )
                )
              }
            />
            <div style={{ height: 6 }} />
            <PopInput
              type="number"
              value={g.point}
              onChange={(e) =>
                setGoals((prev) =>
                  prev.map((x) =>
                    x.id === g.id ? { ...x, point: Number(e.target.value) } : x
                  )
                )
              }
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <PopButton onClick={() => saveGoal(g.id)}>保存</PopButton>
              <PopButton variant="danger" onClick={() => removeGoal(g.id)}>
                削除
              </PopButton>
            </div>
          </div>
        ))}
      </PopCard>

      <PopCard icon="👥" title="ユーザー管理（PN・権限）">
        {users.map((u) => (
          <div key={u.uid} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 900 }}>{u.email}</div>

            <PopInput
              placeholder="PN（表示名）"
              value={u.name ?? ""}
              onChange={(e) =>
                setUsers((prev) =>
                  prev.map((x) =>
                    x.uid === u.uid ? { ...x, name: e.target.value } : x
                  )
                )
              }
            />

            <div style={{ height: 6 }} />

            <PopSelect
              value={u.role}
              onChange={(e) =>
                setUsers((prev) =>
                  prev.map((x) =>
                    x.uid === u.uid
                      ? { ...x, role: e.target.value as Role }
                      : x
                  )
                )
              }
            >
              <option value="viewer">閲覧者（見るだけ）</option>
              <option value="editor">入力者（登録できる）</option>
              <option value="admin">管理者</option>
            </PopSelect>

            <div style={{ marginTop: 8 }}>
              <PopButton onClick={() => saveUser(u.uid)}>保存</PopButton>
            </div>
          </div>
        ))}
      </PopCard>
    </PopShell>
  );
}
