import { NextRequest } from "next/server";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import * as ordersController from "@/controllers/orders.controller";

export const POST = createSafeRoute(async (request: NextRequest) => {
  const body = await request.json();
  const result = await ordersController.trackOrder(body);
  if (!result) return apiError("Order not found", 404, "NOT_FOUND");
  return apiSuccess({ order: result });
});
