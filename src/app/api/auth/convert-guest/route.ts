import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { createSessionToken, SESSION_MAX_AGE } from "@/lib/jwt";
import { findOrderById, attachUserToOrder } from "@/services/orders.service";
import { findUserByEmail, findUserByPhone, createUser } from "@/services/users.service";

export const POST = createSafeRoute(async (request: NextRequest) => {
  const body = await request.json();
  const { orderId, password } = body as { orderId?: string; password?: string };

  if (!orderId || !password) {
    return apiError("Order ID and password are required", 400, "VALIDATION_ERROR");
  }

  if (typeof password !== "string" || password.length < 6) {
    return apiError("Password must be at least 6 characters", 400, "VALIDATION_ERROR");
  }

  const order = await findOrderById(orderId);
  if (!order) {
    return apiError("Order not found", 404, "NOT_FOUND");
  }

  if (order.userId) {
    return apiError("This order is already linked to an account", 409, "DUPLICATE");
  }

  const customerEmail = order.customer?.email || null;
  const customerPhone = order.customer?.phone;
  const customerName = order.customer?.name || "";
  const deliveryAddress = order.delivery?.address || "";
  const deliveryCity = order.delivery?.city || "";

  if (customerEmail) {
    const existingByEmail = await findUserByEmail(customerEmail);
    if (existingByEmail) {
      return apiError("An account with this email already exists", 409, "DUPLICATE");
    }
  }

  const existingByPhone = await findUserByPhone(customerPhone);
  if (existingByPhone) {
    return apiError("An account with this phone number already exists", 409, "DUPLICATE");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const userId = await createUser({
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    passwordHash,
    address: deliveryAddress,
    city: deliveryCity,
  });

  const userIdStr = userId.toString();

  await attachUserToOrder(orderId, userIdStr);

  const token = await createSessionToken(userIdStr);

  const response = apiSuccess({ userId: userIdStr, orderId });

  response.cookies.set("user_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
});
