import { NextRequest } from "next/server";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import * as reviewsController from "@/controllers/reviews.controller";

export const GET = createSafeRoute(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return apiError("productId query parameter is required", 400, "VALIDATION_ERROR");
  }

  const result = await reviewsController.getReviews(productId);
  return apiSuccess(result);
});

export const POST = createSafeRoute(async (request: NextRequest) => {
  const body = await request.json();
  const result = await reviewsController.submitReview(body);
  return apiSuccess(result, 201);
});
