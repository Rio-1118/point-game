"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  addDoc,
  orderBy,
  query,
} from "firebase/firestore";

import { watchAuthAndRole, type Role } from "@/lib/role";
import { db } from "@/lib/firebase";

import {
  PopShell,
  PopCard,
  PopButton,
  PopInput,
  PopPill,
} from "@/components/PopUI";

type UserDoc = {
  id: string;
  email: string;
  role: Role;
  name?: string;
};

type Goal = {
  id: string;
  label: string;
  point: number;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<UserDoc[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [newGoalLabel, setNewGoalLabel] = useState("");
  const [newGoalPoint, setNewGoalPoint] = useState(100);

  // 権限確認
  useEffect(() => {
    const unsub = watchAuthAndRole(
      async (info) => {
        if (info.role !== "admin") {
          router.replace("/");
          return;
        }

        await loadUsers();
        await loadGoals();

        setLoading(false);
      },
      () => router.replace("/login")
    );

    return () => unsub();
  }, [router]);

  // users読み込み
  async function loadUsers() {
    const snap = await getDocs(collection(db, "users"));

    const list: UserDoc[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    setUsers(list);
  }

  // goals読み込み
  async function loadGoals() {
    const snap = await getDocs(
      query(collection(db, "goals"), orderBy("point"))
    );

    const list: Goal[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    setGoals(list);
  }

  // role変更
  async function changeRole(uid: string, role: Role) {
    await updateDoc(doc(db, "users", uid), { role });
    await loadUsers();
  }

  // PN変更
  async function changeName(uid: string, name: string) {
    await updateDoc(doc(db, "users", uid), { name });
    await loadUsers();
  }

  // ゴール追加
  async function addGoal() {
    if (!newGoalLabel || !newGoalPoint) return;

    await addDoc(collection(db, "goals"), {
      label: newGoalLabel,
      point: Number(newGoalPoint),
    });

    setNewGoalLabel("");
    setNewGoalPoint(100);

    await loadGoals();
  }

  // ゴール編集
  async function updateGoal(id: string, label: string, point: number) {
    await updateDoc(doc(db, "goals", id), {
      label,
      point: Number(point),
    });

    await loadGoals();
  }

  if (loading) {
    return (
      <PopShell>
        <PopCard icon="⏳" title="確認中">
          少し待ってね
        </PopCard>
      </PopShell>
    );
  }

  return (
    <PopShell>

      {/* ユーザー管理 */}
      <PopCard icon="👥" title="ユーザー管理">

        {users.map((u) => (
          <div key={u.id} style={{ marginBottom: 16 }}>

            <PopPill>{u.email}</PopPill>

            <div style={{ marginTop: 6 }}>

              PN：
              <PopInput
                defaultValue={u.name || ""}
                onBlur={(e) =>
                  changeName(u.id, e.target.value)
                }
              />

            </div>

            <div style={{ marginTop: 6 }}>

              権限：

              <PopButton onClick={() => changeRole(u.id, "viewer")}>
                viewer
              </PopButton>

              <PopButton onClick={() => changeRole(u.id, "editor")}>
                editor
              </PopButton>

              <PopButton onClick={() => changeRole(u.id, "admin")}>
                admin
              </PopButton>

            </div>

          </div>
        ))}

      </PopCard>


      {/* ゴール追加 */}
      <PopCard icon="➕" title="ゴール追加">

        <div>名前</div>

        <PopInput
          value={newGoalLabel}
          onChange={(e) => setNewGoalLabel(e.target.value)}
        />

        <div>ポイント</div>

        <PopInput
          type="number"
          value={newGoalPoint}
          onChange={(e) =>
            setNewGoalPoint(Number(e.target.value))
          }
        />

        <PopButton onClick={addGoal}>
          追加
        </PopButton>

      </PopCard>


      {/* ゴール一覧 */}
      <PopCard icon="🎯" title="ゴール編集">

        {goals.map((g) => (

          <div key={g.id} style={{ marginBottom: 12 }}>

            <PopInput
              defaultValue={g.label}
              onBlur={(e) =>
                updateGoal(g.id, e.target.value, g.point)
              }
            />

            <PopInput
              type="number"
              defaultValue={g.point}
              onBlur={(e) =>
                updateGoal(
                  g.id,
                  g.label,
                  Number(e.target.value)
                )
              }
            />

          </div>

        ))}

      </PopCard>

    </PopShell>
  );
}
