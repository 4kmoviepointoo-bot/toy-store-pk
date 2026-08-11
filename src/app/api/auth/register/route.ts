import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { createUserSessionToken, SESSION_MAX_AGE } from "@/lib/jwt";
import { findUserByEmail, findUserByPhone, createUser } from "@/services/users.service";

export const POST = createSafeRoute(async (request: NextRequest) => {
  const body = await request.json();
  const { name, email, phone, password, address, city } = body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    address?: string;
    city?: string;
  };

  if (!name || !phone || !password) {
    return apiError("Name, phone, and password are required", 400, "VALIDATION_ERROR");
  }

  if (typeof password !== "string" || password.length < 6) {
    return apiError("Password must be at least 6 characters", 400, "VALIDATION_ERROR");
  }

  const checks: Promise<unknown>[] = [findUserByPhone(phone)];
  if (email) checks.push(findUserByEmail(email));
  const [existingByPhone, existingByEmail] = await Promise.all(checks);

  if (existingByEmail) {
    return apiError("An account with this email already exists", 409, "DUPLICATE");
  }
  if (existingByPhone) {
    return apiError("An account with this phone number already exists", 409, "DUPLICATE");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const userId = await createUser({
    name,
    email: email || null,
    phone,
    passwordHash,
    address: address || "",
    city: city || "",
  });

  const userIdStr = userId.toString();
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
