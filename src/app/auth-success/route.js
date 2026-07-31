import { NextResponse } from "next/server";

export async function GET(request) {

  const token = "YOUR_CUSTOM_TOKEN";

  const response = NextResponse.redirect(
    new URL("/dashboard", request.url)
  );

  response.cookies.set(
    "auth_token",
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    }
  );

  return response;
}