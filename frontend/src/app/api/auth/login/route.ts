import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.formData(); // since you're sending x-www-form-urlencoded
  const username = body.get("username") as string;
  const password = body.get("password") as string;

  try {
    const formBody = new URLSearchParams();
    formBody.append("username", username);
    formBody.append("password", password);

    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.detail }, { status: res.status });
    }

    const data = await res.json();
    const { access_token } = data;

    // Set HttpOnly cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
