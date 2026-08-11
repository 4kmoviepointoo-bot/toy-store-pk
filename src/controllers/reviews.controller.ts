import { ApiError } from "@/lib/api-wrapper";
import { products } from "@/lib/products";
import * as reviewsService from "@/services/reviews.service";

export async function getReviews(productId: string) {
  return reviewsService.getReviewsByProductId(productId);
}

export async function submitReview(body: Record<string, unknown>) {
  const { productId, customerName, rating, comment } = body;

  if (!productId || typeof productId !== "string") {
    throw new ApiError(400, "Product ID is required", "VALIDATION_ERROR");
  }
  if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
    throw new ApiError(400, "Customer name is required", "VALIDATION_ERROR");
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new ApiError(400, "Rating must be an integer between 1 and 5", "VALIDATION_ERROR");
  }
  if (!comment || typeof comment !== "string" || !comment.trim()) {
    throw new ApiError(400, "Comment is required", "VALIDATION_ERROR");
  }

  return reviewsService.createReview({
    productId,
    customerName: customerName.trim(),
    rating,
    comment: comment.trim(),
  });
}

export async function getProductsRatings() {
  const ratingsMap = await reviewsService.getAllProductRatings();
  return products.map((p) => {
    const dbData = ratingsMap.get(p.slug);
    return {
      slug: p.slug,
      averageRating: dbData?.averageRating ?? p.rating,
      totalReviews: dbData?.totalReviews ?? p.reviews,
    };
  });
}
