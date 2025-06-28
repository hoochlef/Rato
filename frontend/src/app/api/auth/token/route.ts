import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-server";

export async function GET() {
  const payload = await getUserFromCookie();
  if (!payload || !payload.token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }
  return NextResponse.json({ token: payload.token });
}
