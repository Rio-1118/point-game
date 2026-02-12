import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function proxy(_req: NextRequest) {
  return NextResponse.next();
}

// （必要なら残してOK。なくても動く）
// export const config = { matcher: ["/:path*"] };
