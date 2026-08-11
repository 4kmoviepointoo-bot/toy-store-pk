import { NextRequest } from "next/server";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import * as couponsController from "@/controllers/coupons.controller";

export const POST = createSafeRoute(async (request: NextRequest) => {
  const { code, subtotal } = await request.json();

  if (typeof code !== "string" || !code.trim()) {
    return apiError("Coupon code is required", 400, "VALIDATION_ERROR");
  }
  if (typeof subtotal !== "number" || subtotal < 0) {
    return apiError("Invalid subtotal", 400, "VALIDATION_ERROR");
  }

  try {
    const result = await couponsController.validateCouponCode(code, subtotal);
    return apiSuccess({
      valid: result.valid,
      discountAmount: result.discountAmount,
      shippingAdjustment: result.shippingAdjustment,
      message: result.message,
      couponType: result.coupon?.type || null,
      couponCode: result.coupon?.code || null,
    });
  } catch {
    return apiSuccess({
      valid: false,
      discountAmount: 0,
      shippingAdjustment: 0,
      message: "Coupon system temporarily unavailable",
      couponType: null,
      couponCode: null,
    });
  }
});
