"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { watchAuthAndRole, type Role } from "@/lib/role";
import { fetchEvents } from "@/lib/events_read";
import { fetchGoals, type Goal } from "@/lib/goals";
import { PopShell, PopCard, PopBigNumber, PopButton, PopPill } from "@/components/PopUI";

export default function ViewPage() {
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // ログイン情報
  const [uid, setUid] = useState<string>("");
  const [role, setRole] = useState<Role | null>(null);

  // 同じゴールで何回も演出しない
  const celebratedRef = useRef<string | null>(null);

  useEffect(() => {
    const unsub = watchAuthAndRole(
      async (info) => {
        setUid(info.uid);
        setRole(info.role);

        const e = await fetchEvents();
        const g = await fetchGoals();
        setEvents(e);
        setGoals(g);
        setLoading(false);
      },
      () => router.replace("/login")
    );

    return () => unsub();
  }, [router]);

  // 合計ポイント
  const total = useMemo(
    () => events.reduce((s, e) => s + Number(e.delta || 0), 0),
    [events]
  );

  // 次のゴール
  const nextGoal = goals.find((g) => total < g.point);

  // 達成したゴール（直近で一番大きい達成ゴール）
  const latestAchieved = [...goals].reverse().find((g) => total >= g.point) || null;

  // 🎉 達成演出
  useEffect(() => {
    if (!latestAchieved) return;
    if (celebratedRef.current === latestAchieved.id) return;

    celebratedRef.current = latestAchieved.id;

    confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 } });

    const audio = new Audio("/celebrate.mp3");
    audio.play().catch(() => {});
  }, [latestAchieved]);

  const remain = nextGoal ? Math.max(nextGoal.point - total, 0) : 0;

  async function onDelete(id: string) {
    const ok = confirm("この履歴を削除しますか？（戻せません）");
    if (!ok) return;

    try {
      const { deleteEvent } = await import("@/lib/events");
      await deleteEvent(id);
      setEvents((prev) => prev.filter((x) => x.id !== id));
    } catch (err: any) {
      alert(`削除できませんでした: ${err?.message ?? err}`);
    }
  }

  if (loading) {
    return (
      <PopShell>
        <PopCard icon="⏳" title="読み込み中…">
          少し待ってね
        </PopCard>
      </PopShell>
    );
  }

  return (
    <PopShell>
      <PopCard icon="🌳" title="合計ポイント">
        <PopBigNumber>{total} 点</PopBigNumber>
        <div style={{ marginTop: 6 }}>
          <PopPill>みんなで育てる</PopPill>
        </div>
      </PopCard>

      <PopCard icon="🎁" title="次のゴール">
        {nextGoal ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{nextGoal.label}</div>
            <div style={{ fontSize: 36, fontWeight: 950, marginTop: 6 }}>
              あと {remain} 点
            </div>
          </>
        ) : (
          <div style={{ fontSize: 30, fontWeight: 950 }}>🎉 ぜんぶ達成！</div>
        )}
      </PopCard>

      <PopCard icon="🎯" title="ゴール一覧">
        {goals.length === 0 ? (
          <div>まだゴールがありません</div>
        ) : (
          goals.map((g) => (
            <div
              key={g.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900 }}>
                {g.point} 点：{g.label}
              </div>
              <div>{total >= g.point ? "✅ 達成" : ""}</div>
            </div>
          ))
        )}
      </PopCard>

      <PopCard icon="📜" title="履歴">
        {events.length === 0 ? (
          <div>まだ履歴がありません</div>
        ) : (
          events.map((e: any) => {
            // 編集：adminは全部OK / editorは自分だけOK
            const canEdit =
              role === "admin" || (role === "editor" && uid && e.createdBy === uid);

            // 削除：本人のみ（adminでも他人は不可）
            const canDelete = uid && e.createdBy === uid;

            return (
              <div
                key={e.id}
                style={{
                  padding: "10px 0",
                  borderTop: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ fontWeight: 900 }}>
                  {e.date} ／ {e.delta >= 0 ? "+" : ""}
                  {e.delta} 点
                </div>

                <div>理由：{e.reasonLabel}</div>
                <div>
                  だれが：<b>{e.createdByName || "（不明）"}</b>
                </div>
                {e.note ? <div style={{ opacity: 0.85 }}>メモ：{e.note}</div> : null}

                {(canEdit || canDelete) ? (
                  <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {canEdit ? (
                      <PopButton onClick={() => router.push(`/edit/${e.id}`)}>
                        ✏️ 編集する
                      </PopButton>
                    ) : null}

                    {canDelete ? (
                      <PopButton variant="danger" onClick={() => onDelete(e.id)}>
                        🗑 削除（本人のみ）
                      </PopButton>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </PopCard>

      <PopButton variant="ghost" onClick={() => router.push("/")}>
        戻る
      </PopButton>
    </PopShell>
  );
}