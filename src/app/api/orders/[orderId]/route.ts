import { NextRequest } from "next/server";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { findOrderByIdPublic } from "@/services/orders.service";

export const GET = createSafeRoute(
  async (
    _request: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    const params = context?.params ? await context.params : undefined;
    const orderId = params?.orderId;

    if (!orderId) {
      return apiError("Order ID is required", 400, "VALIDATION_ERROR");
    }

    const order = await findOrderByIdPublic(orderId);
    if (!order) {
      return apiError("Order not found", 404, "NOT_FOUND");
    }

    return apiSuccess(order);
  }
);
