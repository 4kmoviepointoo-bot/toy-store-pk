import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/jwt";

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie?.value) return false;

    const result = await verifySessionToken(sessionCookie.value);
    return result !== null;
  } catch {
    return false;
  }
}
