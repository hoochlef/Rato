import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  const business_id = searchParams.get("business_id");

  if (!business_id) {
    return NextResponse.json({ message: "Business ID is required." }, { status: 400 });
  }

  try {
    const response = await fetch(`http://localhost:8000/reviews/${business_id}`, {
      method: "GET",
    });

    if (response.status === 404) {
      return NextResponse.json([]); 
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Failed to get reviews :", errorData);
      throw new Error(`Failed to get reviews. Status: ${response.status}`);
    }

    const reviewsData = await response.json();
    return NextResponse.json(reviewsData || []);
  } catch (error) {
    console.error("Error getting reviews:", error);
    return NextResponse.json([]);
  }
}