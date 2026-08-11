import { NextRequest } from "next/server";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { verifyAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { seedProductsIfNeeded, formatPrice, getBadgeColor } from "@/lib/seedProducts";
import { ObjectId } from "mongodb";

const COLLECTION = "products";

let seeded = false;

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
    priceFormatted: formatPrice(doc.price),
    originalPrice: doc.originalPrice,
    originalPriceFormatted: doc.originalPrice ? formatPrice(doc.originalPrice) : "",
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
    badgeColor: getBadgeColor(doc.badge),
    isFreeDelivery: doc.isFreeDelivery,
    ageGroup: doc.ageGroup,
    tags: doc.tags,
    rating: doc.rating,
    reviews: doc.reviews,
    createdAt: doc.createdAt?.toISOString() || "",
    updatedAt: doc.updatedAt?.toISOString() || "",
  };
}

function serializeForFrontend(doc: ProductDoc) {
  return {
    slug: doc.slug,
    name: doc.name,
    price: formatPrice(doc.price),
    originalPrice: doc.originalPrice ? formatPrice(doc.originalPrice) : "",
    rating: doc.rating,
    reviews: doc.reviews,
    badge: doc.badge,
    badgeColor: getBadgeColor(doc.badge),
    image: doc.image,
    images: doc.images && doc.images.length > 0 ? doc.images : [doc.image],
    description: doc.description,
    highlights: doc.highlights || [],
    brand: doc.brand || "ToyVerse",
    material: doc.material || "ABS Plastic",
    pieces: doc.pieces || "",
    ageRange: doc.ageRange || "3+ Years",
    isFreeDelivery: doc.isFreeDelivery,
    ageGroup: doc.ageGroup,
    category: doc.category,
    tags: doc.tags,
  };
}

export const GET = createSafeRoute(async (request: NextRequest) => {
  if (!seeded) {
    await seedProductsIfNeeded();
    seeded = true;
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const { db } = await connectToDatabase();
  const docs = await db
    .collection<ProductDoc>(COLLECTION)
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  if (format === "frontend") {
    return apiSuccess(docs.map(serializeForFrontend));
  }

  return apiSuccess(docs.map(serializeProduct));
});

export const POST = createSafeRoute(async (request: NextRequest) => {
  const authed = await verifyAdminSession();
  if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const body = await request.json();
  const { name, price, originalPrice, category, image, images, description, highlights, brand, material, pieces, ageRange, stock, badge, isFreeDelivery, ageGroup, tags } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return apiError("Product name is required", 400, "VALIDATION_ERROR");
  }
  if (typeof price !== "number" || price <= 0) {
    return apiError("Price must be a positive number", 400, "VALIDATION_ERROR");
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { db } = await connectToDatabase();

  const primaryImage = image || "/images/placeholder.svg";
  const galleryImages = Array.isArray(images) && images.length > 0 ? images : [primaryImage];

  const parsedHighlights = Array.isArray(highlights)
    ? highlights
    : typeof highlights === "string" && highlights.trim()
    ? highlights.split("\n").map((h: string) => h.trim()).filter(Boolean)
    : [];

  const doc: ProductDoc = {
    name: name.trim(),
    slug,
    price,
    originalPrice: typeof originalPrice === "number" && originalPrice > 0 ? originalPrice : null,
    category: category || "Educational Toys",
    image: primaryImage,
    images: galleryImages,
    description: description || "",
    highlights: parsedHighlights,
    brand: brand || "ToyVerse",
    material: material || "ABS Plastic",
    pieces: typeof pieces === "number" ? String(pieces) : (pieces || ""),
    ageRange: ageRange || "3+ Years",
    stock: typeof stock === "number" ? stock : 0,
    badge: badge || "",
    isFreeDelivery: Boolean(isFreeDelivery),
    ageGroup: ageGroup || "3-5 Years",
    tags: Array.isArray(tags) ? tags : [],
    rating: 0,
    reviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection<ProductDoc>(COLLECTION).insertOne(doc);
  return apiSuccess(serializeProduct({ ...doc, _id: result.insertedId }), 201);
});
