import { ApiError } from "@/lib/api-wrapper";
import * as orderService from "@/services/orders.service";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function createOrder(body: Record<string, unknown>) {
  if (!body.orderId || !body.name || !body.phone || !body.address || !body.city || !Array.isArray(body.items) || body.items.length === 0) {
    throw new ApiError(400, "Missing required fields", "VALIDATION_ERROR");
  }

  await orderService.createOrder({
    orderId: body.orderId as string,
    customer: { name: body.name as string, phone: body.phone as string, email: (body.email as string) || null },
    delivery: { address: body.address as string, city: body.city as string },
    items: body.items as Array<{ name: string; price: string; image: string; quantity: number }>,
    subtotal: body.subtotal as number,
    shipping: body.shipping as number,
    couponCode: (body.couponCode as string) || null,
    couponDiscount: (body.couponDiscount as number) || 0,
    total: body.total as number,
    paymentMethod: body.paymentMethod as string,
    paymentLabel: body.paymentLabel as string,
  });

  return { orderId: body.orderId as string };
}

export async function listOrders() {
  return orderService.getAllOrders();
}

export async function updateOrder(body: Record<string, unknown>) {
  const { id, status, currentLocation } = body;

  if (!id || !status) throw new ApiError(400, "Missing id or status", "VALIDATION_ERROR");
  if (!VALID_STATUSES.includes(status as string)) throw new ApiError(400, "Invalid status", "VALIDATION_ERROR");

  const updated = await orderService.updateOrderStatus(id as string, status as string, currentLocation as string | undefined);
  if (!updated) throw new ApiError(404, "Order not found", "NOT_FOUND");

  return { status, currentLocation: currentLocation || undefined };
}

export async function trackOrder(body: Record<string, unknown>) {
  const orderId = (body.orderId as string)?.toString().trim().toUpperCase();
  const phone = (body.phone as string)?.toString().trim().replace(/[\s\-]/g, "");

  if (!orderId || !phone) throw new ApiError(400, "Order ID and phone number are required", "VALIDATION_ERROR");

  const order = await orderService.findOrderById(orderId);
  if (!order) throw new ApiError(404, "Order not found. Please check your Order ID.", "NOT_FOUND");

  const orderPhone = order.customer?.phone?.toString().trim().replace(/[\s\-]/g, "");
  if (orderPhone !== phone) throw new ApiError(404, "Phone number does not match our records.", "NOT_FOUND");

  return {
    orderId: order.orderId,
    date: order.createdAt,
    status: order.status,
    items: (order.items || []).map((item: Record<string, unknown>) => ({
      title: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    total: order.total,
    delivery: { address: order.delivery?.address, city: order.delivery?.city },
    currentLocation: order.currentLocation || "",
    paymentMethod: order.paymentLabel || order.paymentMethod,
  };
}
