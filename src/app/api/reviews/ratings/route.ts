import { createSafeRoute, apiSuccess } from "@/lib/api-wrapper";
import * as reviewsController from "@/controllers/reviews.controller";

export const GET = createSafeRoute(async () => {
  const result = await reviewsController.getProductsRatings();
  return apiSuccess(result);
});
