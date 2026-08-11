import { createSafeRoute, apiSuccess } from "@/lib/api-wrapper";
import { getAuthenticatedUser } from "@/lib/user-auth";

export const GET = createSafeRoute(async () => {
  const user = await getAuthenticatedUser();
  return apiSuccess({ user });
});
