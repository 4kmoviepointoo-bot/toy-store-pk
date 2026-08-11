import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { getAuthenticatedUser } from "@/lib/user-auth";

export const GET = createSafeRoute(async () => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("Not authenticated", 401, "UNAUTHORIZED");
  }
  return apiSuccess({ user });
});
