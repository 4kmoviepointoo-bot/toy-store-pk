import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { createUserSessionToken, SESSION_MAX_AGE } from "@/lib/jwt";
import { findUserByEmail, findUserByPhone } from "@/services/users.service";

export const POST = createSafeRoute(async (request: NextRequest) => {
  const body = await request.json();
  const { identifier, password } = body as {
    identifier?: string;
    email?: string;
    password?: string;
  };

  const loginId = identifier || (body as Record<string, string>).email;

  if (!loginId || !password) {
    return apiError("Email/phone and password are required", 400, "VALIDATION_ERROR");
  }

  let user = await findUserByEmail(loginId);
  if (!user) {
    user = await findUserByPhone(loginId);
  }
  if (!user) {
    return apiError("Invalid credentials", 401, "AUTH_FAILED");
  }

  if (!user.passwordHash) {
    console.error("[Login] User found but passwordHash is missing:", user._id);
    return apiError("Account setup incomplete. Please register again.", 400, "ACCOUNT_INCOMPLETE");
  }

  let valid = false;
  try {
    valid = await bcrypt.compare(password, user.passwordHash);
  } catch (err) {
    console.error("[Login] bcrypt.compare failed:", err);
    return apiError("Invalid credentials", 401, "AUTH_FAILED");
  }

  if (!valid) {
    return apiError("Invalid credentials", 401, "AUTH_FAILED");
  }

  const userIdStr = user._id!.toString();
  const token = await createUserSessionToken(userIdStr);

  const response = apiSuccess({ userId: userIdStr });

  response.cookies.set("user_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
});
