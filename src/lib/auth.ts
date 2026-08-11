import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/jwt";

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie?.value) return false;

    const result = await verifyAdminSessionToken(sessionCookie.value);
    return result !== null && result.sub === "admin";
  } catch {
    return false;
  }
}
