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

  const total = useMemo(() => events.reduce((s, e) => s