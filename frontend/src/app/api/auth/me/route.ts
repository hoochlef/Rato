// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-server";

export async function GET() {
  const payload = await getUserFromCookie();
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const res = await fetch(`http://localhost:8000/users/me`, {
      headers: {
        // if FastAPI requires token to verify the request, include it
        Authorization: `Bearer ${payload.token}`, // only if needed
      },
    });

    if (!res.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await res.json();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
