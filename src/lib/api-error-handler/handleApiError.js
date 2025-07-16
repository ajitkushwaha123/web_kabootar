import { NextResponse } from "next/server";

export function handleApiError(error) {
  switch (error?.message) {
    case "UNAUTHORIZED":
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    case "NOT_FOUND":
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    default:
      console.error("API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
  }
}
