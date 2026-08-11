import { SignJWT, jwtVerify } from "jose";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

let cachedAdminSecret: Uint8Array | null = null;
let cachedUserSecret: Uint8Array | null = null;

function getAdminJwtSecret(): Uint8Array {
  if (cachedAdminSecret) return cachedAdminSecret;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET environment variable is not set");
  cachedAdminSecret = new TextEncoder().encode(secret);
  return cachedAdminSecret;
}

function getUserJwtSecret(): Uint8Array {
  if (cachedUserSecret) return cachedUserSecret;
  const secret = process.env.USER_SESSION_SECRET;
  if (!secret) throw new Error("USER_SESSION_SECRET environment variable is not set");
  cachedUserSecret = new TextEncoder().encode(secret);
  return cachedUserSecret;
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getAdminJwtSecret());
}

export async function createUserSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getUserJwtSecret());
}

export async function verifyAdminSessionToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getAdminJwtSecret());
    if (!payload.sub || typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

export async function verifyUserSessionToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getUserJwtSecret());
    if (!payload.sub || typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

/** @deprecated Use createAdminSessionToken or createUserSessionToken instead */
export async function createSessionToken(userId: string): Promise<string> {
  return createUserSessionToken(userId);
}

/** @deprecated Use verifyAdminSessionToken or verifyUserSessionToken instead */
export async function verifySessionToken(token: string): Promise<{ sub: string } | null> {
  return verifyUserSessionToken(token);
}

export { SESSION_MAX_AGE };
