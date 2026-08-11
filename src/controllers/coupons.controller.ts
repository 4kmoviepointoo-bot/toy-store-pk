import { ApiError } from "@/lib/api-wrapper";
import * as couponService from "@/services/coupons.service";

const SHIPPING_FEE = 150;

export interface CouponValidation {
  valid: boolean;
  coupon?: couponService.CouponDoc;
  discountAmount: number;
  shippingAdjustment: number;
  message: string;
}

export async function listCoupons() {
  return couponService.getAllCoupons();
}

export async function validateCouponCode(code: string, subtotal: number): Promise<CouponValidation> {
  const coupon = await couponService.getCouponByCode(code);

  if (!coupon) {
    return { valid: false, discountAmount: 0, shippingAdjustment: 0, message: "Invalid coupon code" };
  }
  if (!coupon.active) {
    return { valid: false, discountAmount: 0, shippingAdjustment: 0, message: "This coupon is no longer active" };
  }
  if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
    return { valid: false, discountAmount: 0, shippingAdjustment: 0, message: "This coupon has expired" };
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return { valid: false, discountAmount: 0, shippingAdjustment: 0, message: `Minimum order of Rs. ${coupon.minOrder.toLocaleString()} required` };
  }

  if (coupon.type === "percentage") {
    return { valid: true, coupon, discountAmount: Math.round((subtotal * coupon.value) / 100), shippingAdjustment: 0, message: `${coupon.value}% discount applied!` };
  }
  if (coupon.type === "fixed") {
    return { valid: true, coupon, discountAmount: Math.min(coupon.value, subtotal), shippingAdjustment: 0, message: `Rs. ${Math.min(coupon.value, subtotal).toLocaleString()} off applied!` };
  }
  if (coupon.type === "free_shipping") {
    return { valid: true, coupon, discountAmount: 0, shippingAdjustment: -SHIPPING_FEE, message: "Free shipping applied!" };
  }

  return { valid: false, discountAmount: 0, shippingAdjustment: 0, message: "Invalid coupon code" };
}

export function parseCouponBody(body: Record<string, unknown>) {
  const { code, type, value, minOrder, active, expiryDate } = body;

  if (!code || typeof code !== "string" || !code.trim()) {
    throw new ApiError(400, "Coupon code is required", "VALIDATION_ERROR");
  }
  if (!["percentage", "fixed", "free_shipping"].includes(type as string)) {
    throw new ApiError(400, "Invalid discount type", "VALIDATION_ERROR");
  }
  if (type !== "free_shipping" && (typeof value !== "number" || value <= 0)) {
    throw new ApiError(400, "Discount value must be a positive number", "VALIDATION_ERROR");
  }
  if (type === "percentage" && typeof value === "number" && value > 100) {
    throw new ApiError(400, "Percentage cannot exceed 100", "VALIDATION_ERROR");
  }
  if (minOrder !== undefined && (typeof minOrder !== "number" || minOrder < 0)) {
    throw new ApiError(400, "Minimum order must be a non-negative number", "VALIDATION_ERROR");
  }

  return {
    code: (code as string).trim().toUpperCase(),
    type: type as "percentage" | "fixed" | "free_shipping",
    value: type === "free_shipping" ? 0 : Number(value),
    minOrder: Number(minOrder) || 0,
    active: active !== false,
    expiryDate: (expiryDate as string) || null,
    usageCount: 0,
  };
}

export function parseCouponUpdate(body: Record<string, unknown>) {
  const { id, code, type, value, minOrder, active, expiryDate } = body;

  if (!id) throw new ApiError(400, "Coupon ID is required", "VALIDATION_ERROR");

  const fields: Record<string, unknown> = {};
  if (code !== undefined) {
    if (typeof code !== "string" || !code.trim()) throw new ApiError(400, "Coupon code cannot be empty", "VALIDATION_ERROR");
    fields.code = (code as string).trim().toUpperCase();
  }
  if (type !== undefined) {
    if (!["percentage", "fixed", "free_shipping"].includes(type as string)) throw new ApiError(400, "Invalid discount type", "VALIDATION_ERROR");
    fields.type = type;
  }
  if (value !== undefined) {
    if (typeof value !== "number" || value < 0) throw new ApiError(400, "Discount value must be a non-negative number", "VALIDATION_ERROR");
    fields.value = value;
  }
  if (minOrder !== undefined) {
    if (typeof minOrder !== "number" || minOrder < 0) throw new ApiError(400, "Minimum order must be a non-negative number", "VALIDATION_ERROR");
    fields.minOrder = minOrder;
  }
  if (active !== undefined) fields.active = Boolean(active);
  if (expiryDate !== undefined) fields.expiryDate = (expiryDate as string) || null;

  if (Object.keys(fields).length === 0) throw new ApiError(400, "No fields to update", "VALIDATION_ERROR");
  return { id: id as string, fields };
}
