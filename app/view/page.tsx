"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { watchAuthAndRole } from "@/lib/role";
import { fetchEvents } from "@/lib/events_read";
import { fetchGoals, type Goal } from "@/lib/goals";
import { PopShell, PopCard, PopBigNumber, PopButton, PopPill } from "@/components/PopUI";

export default function ViewPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // 演出を「同じゴールで何回も出さない」
  const celebratedRef = useRef<string | null>(null);

  useEffect(() => {
    const unsub = watchAuthAndRole(
      async () => {
        const e = await fetchEvents();
        const g = await fetchGoals();
        setEvents(e);
        setGoals(g);
        setLoading(false);
      },
      () => router.replace("/login"),
      () => router.replace("/login")
    );
    return () => unsub();
  }, [router]);

  const total = useMemo(() => events.reduce((s, e) => s + (e.delta || 0), 0), [events]);

  // 次のゴール
  const nextGoal = goals.find((g) => total < g.point);

  // 達成したゴール（直近で一番大きい達成ゴール）
  const latestAchieved = [...goals].reverse().find((g) => total >= g.point) || null;

  // 🎉 達成演出（最新達成ゴールが変わったときだけ）
  useEffect(() => {
    if (!latestAchieved) return;
    if (celebratedRef.current === latestAchieved.id) return;

    celebratedRef.current = latestAchieved.id;

    confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 } });

    // 音（public/celebrate.mp3 がある場合）
    const audio = new Audio("/celebrate.mp3");
    audio.play().catch(() => {});
  }, [latestAchieved]);

  const remain = nextGoal ? Math.max(nextGoal.point - total, 0) : 0;

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
          <div>まだゴールがありません（管理者が追加できます）</div>
        ) : (
          goals.map((g) => (
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0" }}>
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
          events.map((e: any) => (
            <div key={e.id} style={{ padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ fontWeight: 900 }}>
                {e.eventDate} ／ {e.delta >= 0 ? "+" : ""}{e.delta} 点
              </div>
              <div>理由：{e.reasonLabel}</div>
              <div>だれが：<b>{e.createdByName || "（不明）"}</b></div>
              {e.note ? <div style={{ opacity: 0.85 }}>メモ：{e.note}</div> : null}
            </div>
          ))
        )}
      </PopCard>

      <PopButton variant="ghost" onClick={() => router.push("/")}>戻る</PopButton>
    </PopShell>
  );
}
