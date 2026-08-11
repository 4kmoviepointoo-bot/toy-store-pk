import { NextRequest } from "next/server";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { verifyAdminSession } from "@/lib/auth";
import * as couponsController from "@/controllers/coupons.controller";
import * as couponService from "@/services/coupons.service";
import { ObjectId } from "mongodb";

export const GET = createSafeRoute(async () => {
  const authed = await verifyAdminSession();
  if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const coupons = await couponsController.listCoupons();
  return apiSuccess(coupons);
});

export const POST = createSafeRoute(async (request: NextRequest) => {
  const authed = await verifyAdminSession();
  if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const body = await request.json();
  const data = couponsController.parseCouponBody(body);

  const result = await couponService.createCoupon(data);
  if (result.duplicate) return apiError("A coupon with this code already exists", 409, "DUPLICATE");

  return apiSuccess({ coupon: result.coupon }, 201);
});

export const PATCH = createSafeRoute(async (request: NextRequest) => {
  const authed = await verifyAdminSession();
  if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const body = await request.json();
  const { id, fields } = couponsController.parseCouponUpdate(body);

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return apiError("Invalid coupon ID", 400, "VALIDATION_ERROR");
  }

  const result = await couponService.updateCoupon(id, fields);
  if (result.duplicate) return apiError("A coupon with this code already exists", 409, "DUPLICATE");
  if (!result.matched) return apiError("Coupon not found", 404, "NOT_FOUND");

  return apiSuccess({ id, ...fields });
});

export const DELETE = createSafeRoute(async (request: NextRequest) => {
  const authed = await verifyAdminSession();
  if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const { id } = await request.json();
  if (!id) return apiError("Coupon ID is required", 400, "VALIDATION_ERROR");

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return apiError("Invalid coupon ID", 400, "VALIDATION_ERROR");
  }

  const deleted = await couponService.deleteCoupon(id);
  if (!deleted) return apiError("Coupon not found", 404, "NOT_FOUND");

  return apiSuccess({ id });
});
