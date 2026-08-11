import { NextRequest } from "next/server";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { verifyAdminSession } from "@/lib/auth";
import * as ordersController from "@/controllers/orders.controller";
import { sendOrderNotification } from "@/lib/notifications";

export const POST = createSafeRoute(async (request: NextRequest) => {
  const body = await request.json();
  const result = await ordersController.createOrder(body);

  console.log("[Orders] Order saved successfully:", result.orderId);

  // Build notification data from the request body
  const notificationData = {
    orderId: body.orderId as string,
    customer: {
      name: body.name as string,
      phone: body.phone as string,
      email: (body.email as string) || null,
    },
    delivery: {
      address: body.address as string,
      city: body.city as string,
    },
    items: body.items as Array<{ name: string; price: string; quantity: number }>,
    subtotal: body.subtotal as number,
    shipping: body.shipping as number,
    couponCode: (body.couponCode as string) || null,
    couponDiscount: (body.couponDiscount as number) || 0,
    total: body.total as number,
    paymentLabel: (body.paymentLabel as string) || "Cash on Delivery",
  };

  console.log("[Orders] Sending email notification for order:", notificationData.orderId);

  // Send email notification in background — don't block the response
  sendOrderNotification(notificationData).catch((err) =>
    console.error("[Orders] Background email notification failed:", err)
  );

  return apiSuccess(result, 201);
});

export const GET = createSafeRoute(async () => {
  const authed = await verifyAdminSession();
  if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const orders = await ordersController.listOrders();
  return apiSuccess(orders);
});

export const PATCH = createSafeRoute(async (request: NextRequest) => {
  const authed = await verifyAdminSession();
  if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const body = await request.json();
  const result = await ordersController.updateOrder(body);
  return apiSuccess(result);
});
