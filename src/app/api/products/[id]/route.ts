import { NextRequest } from "next/server";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { verifyAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

const COLLECTION = "products";

interface ProductDoc {
  _id?: ObjectId;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  category: string;
  image: string;
  images: string[];
  description: string;
  highlights: string[];
  brand: string;
  material: string;
  pieces: string;
  ageRange: string;
  stock: number;
  badge: string;
  isFreeDelivery: boolean;
  ageGroup: string;
  tags: string[];
  rating: number;
  reviews: number;
  createdAt: Date;
  updatedAt: Date;
}

function serializeProduct(doc: ProductDoc) {
  return {
    _id: doc._id?.toString() || "",
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    originalPrice: doc.originalPrice,
    category: doc.category,
    image: doc.image,
    images: doc.images && doc.images.length > 0 ? doc.images : [doc.image],
    description: doc.description,
    highlights: doc.highlights || [],
    brand: doc.brand || "ToyVerse",
    material: doc.material || "ABS Plastic",
    pieces: doc.pieces || "",
    ageRange: doc.ageRange || "3+ Years",
    stock: doc.stock,
    badge: doc.badge,
    isFreeDelivery: doc.isFreeDelivery,
    ageGroup: doc.ageGroup,
    tags: doc.tags,
    rating: doc.rating,
    reviews: doc.reviews,
    createdAt: doc.createdAt?.toISOString() || "",
    updatedAt: doc.updatedAt?.toISOString() || "",
  };
}

export const GET = createSafeRoute(
  async (_request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) return apiError("Product ID is required", 400, "VALIDATION_ERROR");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return apiError("Invalid product ID", 400, "VALIDATION_ERROR");
    }

    const { db } = await connectToDatabase();
    const doc = await db.collection<ProductDoc>(COLLECTION).findOne({ _id: objectId });
    if (!doc) return apiError("Product not found", 404, "NOT_FOUND");

    return apiSuccess(serializeProduct(doc));
  }
);

export const PUT = createSafeRoute(
  async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const authed = await verifyAdminSession();
    if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

    const params = await context?.params;
    const id = params?.id;
    if (!id) return apiError("Product ID is required", 400, "VALIDATION_ERROR");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return apiError("Invalid product ID", 400, "VALIDATION_ERROR");
    }

    const body = await request.json();
    const { name, price, originalPrice, category, image, images, description, highlights, brand, material, pieces, ageRange, stock, badge, isFreeDelivery, ageGroup, tags } = body;

    const updateFields: Record<string, unknown> = { updatedAt: new Date() };

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) return apiError("Product name cannot be empty", 400, "VALIDATION_ERROR");
      updateFields.name = name.trim();
      updateFields.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    if (price !== undefined) {
      if (typeof price !== "number" || price <= 0) return apiError("Price must be positive", 400, "VALIDATION_ERROR");
      updateFields.price = price;
    }
    if (originalPrice !== undefined) updateFields.originalPrice = typeof originalPrice === "number" && originalPrice > 0 ? originalPrice : null;
    if (category !== undefined) updateFields.category = category;
    if (image !== undefined) updateFields.image = image;
    if (images !== undefined) {
      const arr = Array.isArray(images) ? images.filter((u: string) => u && u.trim()) : [];
      updateFields.images = arr.length > 0 ? arr : [image || "/images/placeholder.svg"];
    }
    if (description !== undefined) updateFields.description = description;
    if (highlights !== undefined) {
      updateFields.highlights = Array.isArray(highlights)
        ? highlights
        : typeof highlights === "string" && highlights.trim()
        ? highlights.split("\n").map((h: string) => h.trim()).filter(Boolean)
        : [];
    }
    if (brand !== undefined) updateFields.brand = brand;
    if (material !== undefined) updateFields.material = material;
    if (pieces !== undefined) updateFields.pieces = typeof pieces === "number" ? String(pieces) : pieces;
    if (ageRange !== undefined) updateFields.ageRange = ageRange;
    if (stock !== undefined) {
      if (typeof stock !== "number" || stock < 0) return apiError("Stock must be non-negative", 400, "VALIDATION_ERROR");
      updateFields.stock = stock;
    }
    if (badge !== undefined) updateFields.badge = badge;
    if (isFreeDelivery !== undefined) updateFields.isFreeDelivery = Boolean(isFreeDelivery);
    if (ageGroup !== undefined) updateFields.ageGroup = ageGroup;
    if (tags !== undefined) updateFields.tags = Array.isArray(tags) ? tags : [];

    const { db } = await connectToDatabase();
    const result = await db.collection<ProductDoc>(COLLECTION).updateOne(
      { _id: objectId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) return apiError("Product not found", 404, "NOT_FOUND");

    revalidatePath("/admin");
    revalidatePath("/api/products");
    revalidatePath("/shop");

    const updated = await db.collection<ProductDoc>(COLLECTION).findOne({ _id: objectId });
    if (!updated) return apiError("Product not found after update", 404, "NOT_FOUND");
    return apiSuccess(serializeProduct(updated));
  }
);

export const DELETE = createSafeRoute(
  async (_request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const authed = await verifyAdminSession();
    if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

    const params = await context?.params;
    const id = params?.id;
    if (!id) return apiError("Product ID is required", 400, "VALIDATION_ERROR");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return apiError("Invalid product ID", 400, "VALIDATION_ERROR");
    }

    const { db } = await connectToDatabase();
    const result = await db.collection<ProductDoc>(COLLECTION).deleteOne({ _id: objectId });

    if (result.deletedCount === 0) return apiError("Product not found", 404, "NOT_FOUND");

    revalidatePath("/admin");
    revalidatePath("/api/products");
    revalidatePath("/shop");

    return apiSuccess({ id });
  }
);
