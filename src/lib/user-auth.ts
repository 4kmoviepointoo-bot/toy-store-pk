import { cookies } from "next/headers";
import { findUserById } from "@/services/users.service";
import type { SerializedUser } from "@/models/User";
import { verifyUserSessionToken } from "@/lib/jwt";

export async function getAuthenticatedUser(): Promise<SerializedUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie?.value) return null;

    const result = await verifyUserSessionToken(sessionCookie.value);
    if (!result) return null;

    const user = await findUserById(result.sub);
    if (!user) return null;

    return {
      _id: user._id?.toString() || "",
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      createdAt: user.createdAt?.toISOString() || "",
    };
  } catch {
    return null;
  }
}
