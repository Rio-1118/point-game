"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { watchAuthAndRole, type Role } from "@/lib/role";
import { db } from "@/lib/firebase";
import { updateEvent } from "@/lib/events";

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

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState("");
  const [role, setRole] = useState<Role | null>(null);

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

  const [ownerUid, setOwnerUid] = useState<string>(""); // このイベントの作成者
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const reasonLabel = useMemo(() => {
    return reasons.find((r) => r.id === reasonId)?.label ?? "理由";
  }, [reasonId, reasons]);

  // 🔒 editor/adminのみ + イベント読み込み
  useEffect(() => {
    const unsub = watchAuthAndRole(
      async (info) => {
        if (info.role !== "editor" && info.role !== "admin") {
          router.replace("/login");
          return;
        }

        setUid(info.uid);
        setRole(info.role);

        // イベント取得
        const snap = await getDoc(doc(db, "events", id));
        if (!snap.exists()) {
          router.replace("/view");
          return;
        }

        const e = snap.data() as any;

        // editor は「自分のイベント」だけ編集OK / adminは全部OK
        const createdBy = String(e.createdBy ?? "");
        setOwnerUid(createdBy);

        if (info.role === "editor" && createdBy !== info.uid) {
          router.replace("/view");
          return;
        }

        // フォームへ反映
        const d = Number(e.delta ?? 0);
        setSign(d >= 0 ? "plus" : "minus");
        setPoints(Math.max(1, Math.abs(d)));

        setEventDate(String(e.date ?? todayYMD()));

        // reasonLabel から reasonId を推定（見つからなければ other）
        const rl = String(e.reasonLabel ?? "");
        const found = reasons.find((r) => r.label === rl);
        setReasonId(found ? found.id : "other");

        setNote(String(e.note ?? ""));

        setLoading(false);
      },
      () => router.replace("/login")
    );

    return () => unsub();
  }, [router, id, reasons]);

  async function onSave() {
    setMsg("");

    if (!eventDate) return setMsg("日付を選んでください");
    if (!points || points < 1) return setMsg("点数は 1 以上にしてください");
    if (reasonId === "other" && note.trim().length === 0) {
      return setMsg("「その他」の場合は理由を入力してください");
    }

    const delta = sign === "plus" ? Math.abs(points) : -Math.abs(points);

    setSaving(true);
    try {
      await updateEvent(id, {
        delta,
        date: eventDate,
        reasonLabel,
        note: note.trim(),
      });

      setMsg("✅ 更新しました！");
    } catch (e: any) {
      setMsg(`❌ 更新できませんでした: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PopShell>
        <PopCard icon="⏳" title="読み込み中…">少し待ってね</PopCard>
      </PopShell>
    );
  }

  return (
    <PopShell>
      <PopCard icon="✏️" title="履歴を編集">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PopPill>権限：{role}</PopPill>
          <PopPill>イベントID：{id}</PopPill>
          {role === "admin" ? <PopPill>作成者UID：{ownerUid}</PopPill> : null}
        </div>
      </PopCard>

      <PopCard icon={sign === "plus" ? "➕" : "➖"} title="点数">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PopButton variant={sign === "plus" ? "primary" : "ghost"} onClick={() => setSign("plus")}>
              ＋ 加点
            </PopButton>
            <PopButton variant={sign === "minus" ? "danger" : "ghost"} onClick={() => setSign("minus")}>
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
                <option key={r.id} value={r.id}>{r.label}</option>
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

      <PopCard icon="💾" title="保存">
        <div style={{ display: "grid", gap: 10 }}>
          <PopButton onClick={onSave} disabled={saving}>
            {saving ? "更新中…" : "更新する"}
          </PopButton>
          <PopButton variant="ghost" onClick={() => router.push("/view")}>
            戻る（履歴へ）
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
