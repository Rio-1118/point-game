"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { watchAuthAndRole, type Role } from "@/lib/role";

export default function AdminPage() {
  const r = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const unsub = watchAuthAndRole(
      ({ role }) => {
        setRole(role);
        if (role !== "admin") r.replace("/"); // 管理者以外は弾く
      },
      () => r.replace("/login") // 未ログインはログインへ
    );
    return () => unsub();
  }, [r]);

  if (role === null) {
    return (
      <main className="min-h-screen grid place-items-center">
        <p>確認中...</p>
      </main>
    );
  }

  if (role !== "admin") {
    return (
      <main className="min-h-screen grid place-items-center">
        <p>権限がありません</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">管理画面</h1>
      <p className="mt-2">ここは admin のみ入れます。</p>
      {/* ここに管理機能を追加 */}
    </main>
  );
}
