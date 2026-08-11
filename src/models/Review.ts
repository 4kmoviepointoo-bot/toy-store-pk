import { ObjectId } from "mongodb";

export interface ReviewDoc {
  _id?: ObjectId;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: Date;
}

export interface SerializedReview {
  _id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ProductRatingSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
}

export function serializeReview(doc: ReviewDoc): SerializedReview {
  return {
    _id: doc._id?.toString() || "",
    productId: doc.productId,
    customerName: doc.customerName,
    rating: doc.rating,
    comment: doc.comment,
    verifiedPurchase: doc.verifiedPurchase,
    createdAt: doc.createdAt.toISOString(),
  };
}
