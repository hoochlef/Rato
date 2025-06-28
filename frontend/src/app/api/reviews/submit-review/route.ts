import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-server";

export async function POST(req: Request) {
  const payload = await getUserFromCookie();
  if (!payload) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { business_id, rating, review_title, review_text } = await req.json();

  try {
    const response = await fetch(`http://localhost:8000/reviews/${business_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.token}`,
      },
      body: JSON.stringify({rating, review_title, review_text }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit review.");
    }

    return NextResponse.json({ message: "Review submitted successfully." });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ message: "Failed to submit review." }, { status: 500 });
  }
}
