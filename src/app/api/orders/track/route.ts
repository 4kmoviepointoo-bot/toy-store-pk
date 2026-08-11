import { NextRequest } from "next/server";
import { createSafeRoute } from "@/lib/api-wrapper";
import * as ordersController from "@/controllers/orders.controller";

export const POST = createSafeRoute(async (request: NextRequest) => {
  const body = await request.json();
  const result = await ordersController.trackOrder(body);
  return new Response(JSON.stringify({ success: true, order: result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
