import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { wishlists } from "@/db/schema";

export async function POST(request: Request) {
  const { name, email } = await request.json();

  if (!name || !email) {
    return NextResponse.json({
      message: "invalid input",
      options: {
        status: 400,
      },
    });
  }

  try {
    await db.insert(wishlists).values({
      name: name,
      email: email,
    });

    return NextResponse.json({
      message: "Succesfully Wishlisted!",
      options: {
        status: 200,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: "Wishlisting Error: " + error,
      options: {
        status: 505,
      },
    });
  }
}
