import { connectToDatabase } from "@/lib/mongodb";
import {
  type ReviewDoc,
  type ProductRatingSummary,
  serializeReview,
} from "@/models/Review";

const COLLECTION = "reviews";

export async function getReviewsByProductId(
  productId: string
): Promise<{ reviews: ReturnType<typeof serializeReview>[]; summary: ProductRatingSummary }> {
  const { db } = await connectToDatabase();

  const docs = await db
    .collection<ReviewDoc>(COLLECTION)
    .find({ productId })
    .sort({ createdAt: -1 })
    .toArray();

  const reviews = docs.map(serializeReview);

  const totalReviews = docs.length;
  const averageRating =
    totalReviews > 0
      ? Math.round((docs.reduce((sum, d) => sum + d.rating, 0) / totalReviews) * 10) / 10
      : 0;

  const summary: ProductRatingSummary = { productId, averageRating, totalReviews };

  return { reviews, summary };
}

export async function createReview(
  data: Omit<ReviewDoc, "_id" | "createdAt" | "verifiedPurchase">
): Promise<ReturnType<typeof serializeReview>> {
  const { db } = await connectToDatabase();

  const doc: ReviewDoc = {
    productId: data.productId,
    customerName: data.customerName,
    rating: data.rating,
    comment: data.comment,
    verifiedPurchase: true,
    createdAt: new Date(),
  };

  const result = await db.collection<ReviewDoc>(COLLECTION).insertOne(doc);
  invalidateRatingsCache();
  return serializeReview({ ...doc, _id: result.insertedId });
}

export async function getRatingSummary(
  productId: string
): Promise<ProductRatingSummary> {
  const { db } = await connectToDatabase();

  const pipeline = [
    { $match: { productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ];

  const aggResult = await db
    .collection<ReviewDoc>(COLLECTION)
    .aggregate(pipeline)
    .toArray();

  return {
    productId,
    averageRating:
      aggResult.length > 0
        ? Math.round((aggResult[0] as { averageRating: number }).averageRating * 10) / 10
        : 0,
    totalReviews: aggResult.length > 0 ? (aggResult[0] as { totalReviews: number }).totalReviews : 0,
  };
}

export async function getAllProductRatings(): Promise<Map<string, ProductRatingSummary>> {
  let cachedRatings = ratingsCache;
  if (cachedRatings && Date.now() - ratingsCacheTimestamp < RATINGS_CACHE_TTL_MS) {
    return cachedRatings;
  }

  const { db } = await connectToDatabase();

  const pipeline = [
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ];

  const aggResult = await db
    .collection<ReviewDoc>(COLLECTION)
    .aggregate(pipeline)
    .toArray();

  const map = new Map<string, ProductRatingSummary>();
  for (const r of aggResult) {
    const doc = r as { _id: string; averageRating: number; totalReviews: number };
    map.set(doc._id, {
      productId: doc._id,
      averageRating: Math.round(doc.averageRating * 10) / 10,
      totalReviews: doc.totalReviews,
    });
  }

  ratingsCache = map;
  ratingsCacheTimestamp = Date.now();

  return map;
}

let ratingsCache: Map<string, ProductRatingSummary> | null = null;
let ratingsCacheTimestamp = 0;
const RATINGS_CACHE_TTL_MS = 300_000;

export function invalidateRatingsCache(): void {
  ratingsCache = null;
  ratingsCacheTimestamp = 0;
}
