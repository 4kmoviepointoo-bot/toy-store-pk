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

  const summary: ProductRatingSummary = {
    productId,
    averageRating:
      aggResult.length > 0
        ? Math.round((aggResult[0] as { averageRating: number }).averageRating * 10) / 10
        : 0,
    totalReviews: aggResult.length > 0 ? (aggResult[0] as { totalReviews: number }).totalReviews : 0,
  };

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
  return map;
}
