import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { getAuthenticatedUser } from "@/lib/user-auth";
import { findOrdersByUserId } from "@/services/orders.service";

export const GET = createSafeRoute(async () => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("Not authenticated", 401, "UNAUTHORIZED");
  }

  const orders = await findOrdersByUserId(user._id);
  return apiSuccess({ orders });
});
