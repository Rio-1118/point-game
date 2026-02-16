"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { watchAuthAndRole, type Role } from "@/lib/role";
import { createEvent } from "@/lib/events";
import { db } from "@/lib/firebase";

import {
  PopShell,
  PopCard,
  PopButton,
  PopInput,
  PopSelect,
  PopTextarea,
  PopPill,
} from "@/components/PopUI";

type Reason = { id: string; label: string };

export default function EntryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [uid, setUid] = useState<string>("");
  const [myName, setMyName] = useState<string>("");

  const [sign, setSign] = useState<"plus" | "minus">("plus");
  const [points, setPoints] = useState<number>(1);
  const [eventDate, setEventDate] = useState<string>(todayYMD());

  const reasons: Reason[] = useMemo(
    () => [
      { id: "help", label: "お手伝いした" },
      { id: "kind", label: "やさしい言葉をかけた" },
      { id: "smile", label: "笑顔にした" },
      { id: "clean", label: "片付け・掃除をした" },
      { id: "promise", label: "約束を守った" },
      { id: "other", label: "その他（自由入力）" },
    ],
    []
  );

  const [reasonId, setReasonId] = useState<string>(reasons[0].id);
  const [note, setNote] = useState<string>("");

  const [msg, setMsg] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const reasonLabel = useMemo(() => {
    return reasons.find((r) => r.id === reasonId)?.label ?? "理由";
  }, [reasonId, reasons]);

  // 🔒 editor/admin だけ入れる ＋ PN取得
  useEffect(() => {
    const unsub = watchAuthAndRole(
      async (info) => {
        // info = { uid, email, role }
        if (info.role !== "editor" && info.role !== "admin") {
          router.replace("/");
          return;
        }

        const snap = await getDoc(doc(db, "users", info.uid));
        const pn =
          snap.exists() && (snap.data() as any).name
            ? String((snap.data() as any).name)
            : info.email
            ? info.email.split("@")[0]
            : "だれか";

        setMyName(pn);
        setUid(info.uid);
        setRole(info.role);
        setLoading(false);
      },
      () => router.replace("/login")
    );

    return () => unsub();
  }, [router]);

  async function onSubmit() {
    setMsg("");

    if (!eventDate) return setMsg("日付を選んでください");
    if (!points || points < 1) return setMsg("点数は 1 以上にしてください");

    if (reasonId === "other" && note.trim().length === 0) {
      return setMsg("「その他」の場合は理由を入力してください");
    }

    const delta = sign === "plus" ? Math.abs(points) : -Math.abs(points);

    setSaving(true);
    try {
      await createEvent({
        delta,
        date: eventDate,
        reasonId,
        reasonLabel,
        note: note.trim(),
        createdBy: uid,
        createdByName: myName,
      });

      setMsg("✅ 登録しました！");
      setPoints(1);
      setReasonId(reasons[0].id);
      setNote("");
    } catch (e: any) {
      setMsg(`❌ 登録できませんでした: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PopShell>
        <PopCard icon="⏳" title="確認中…">少し待ってね</PopCard>
      </PopShell>
    );
  }

  return (
    <PopShell>
      <PopCard icon="✍️" title="入力ページ">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <PopPill>入力者：{myName}</PopPill>
          <PopPill>権限：{role}</PopPill>
        </div>
      </PopCard>

      <PopCard icon={sign === "plus" ? "➕" : "➖"} title="加点 / 減点">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PopButton
              variant={sign === "plus" ? "primary" : "ghost"}
              onClick={() => setSign("plus")}
            >
              ＋ 加点
            </PopButton>
            <PopButton
              variant={sign === "minus" ? "danger" : "ghost"}
              onClick={() => setSign("minus")}
            >
              － 減点
            </PopButton>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 900 }}>点数（1〜100）</div>
            <PopInput
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 900 }}>日付</div>
            <PopInput type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
        </div>
      </PopCard>

      <PopCard icon="📝" title="理由">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 900 }}>理由（選択）</div>
            <PopSelect value={reasonId} onChange={(e) => setReasonId(e.target.value)}>
              {reasons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </PopSelect>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 900 }}>
              理由（自由入力）{reasonId === "other" ? " ※必須" : "（任意）"}
            </div>
            <PopTextarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例：買い物袋を持ってくれた / 片付けしてくれた など"
            />
          </div>
        </div>
      </PopCard>

      {msg ? (
        <PopCard icon={msg.startsWith("✅") ? "✅" : "⚠️"} title="メッセージ">
          <div style={{ fontWeight: 900 }}>{msg}</div>
        </PopCard>
      ) : null}

      <PopCard icon="🚀" title="登録">
        <div style={{ display: "grid", gap: 10 }}>
          <PopButton onClick={onSubmit} disabled={saving}>
            {saving ? "登録中…" : "登録する"}
          </PopButton>
          <PopButton variant="ghost" onClick={() => router.push("/")}>
            戻る
          </PopButton>
        </div>
      </PopCard>
    </PopShell>
  );
}

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
