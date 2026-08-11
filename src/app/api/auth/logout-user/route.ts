import { apiSuccess } from "@/lib/api-wrapper";

export async function POST() {
  const response = apiSuccess({ ok: true });
  response.cookies.set("user_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
