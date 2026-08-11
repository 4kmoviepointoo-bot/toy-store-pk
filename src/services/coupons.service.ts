import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId, type Db } from "mongodb";

const COLLECTION = "coupons";

export interface CouponDoc {
  _id?: ObjectId;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minOrder: number;
  active: boolean;
  expiryDate: string | null;
  usageCount: number;
  createdAt: Date;
}

const DEFAULT_COUPONS = [
  { code: "WELCOME10", type: "percentage" as const, value: 10, minOrder: 0, active: true, expiryDate: null, usageCount: 0 },
  { code: "TOYVERSE100", type: "fixed" as const, value: 100, minOrder: 1000, active: true, expiryDate: null, usageCount: 0 },
];

let seeded = false;

async function ensureSeeded(db: Db): Promise<void> {
  if (seeded) return;
  try {
    const count = await db.collection(COLLECTION).countDocuments();
    if (count > 0) { seeded = true; return; }
    const now = new Date();
    await db.collection(COLLECTION).insertMany(DEFAULT_COUPONS.map((c) => ({ ...c, createdAt: now })));
    console.log("[Coupons] Seeded default coupons: WELCOME10, TOYVERSE100");
    seeded = true;
  } catch {
    // seeding is best-effort
  }
}

function serialize(doc: CouponDoc) {
  return {
    _id: doc._id?.toString() || "",
    code: doc.code,
    type: doc.type,
    value: doc.value,
    minOrder: doc.minOrder || 0,
    active: doc.active !== false,
    expiryDate: doc.expiryDate || null,
    usageCount: doc.usageCount || 0,
    createdAt: doc.createdAt,
  };
}

export async function getAllCoupons() {
  const { db } = await connectToDatabase();
  await ensureSeeded(db);
  const docs = await db.collection<CouponDoc>(COLLECTION).find().sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}

export async function getCouponByCode(code: string): Promise<CouponDoc | null> {
  const { db } = await connectToDatabase();
  return db.collection<CouponDoc>(COLLECTION).findOne({ code: code.toUpperCase() });
}

export async function findCouponById(id: string): Promise<CouponDoc | null> {
  const { db } = await connectToDatabase();
  return db.collection<CouponDoc>(COLLECTION).findOne({ _id: new ObjectId(id) });
}

export async function createCoupon(data: Omit<CouponDoc, "_id" | "createdAt">) {
  const { db } = await connectToDatabase();
  const existing = await db.collection<CouponDoc>(COLLECTION).findOne({ code: data.code.toUpperCase() });
  if (existing) return { duplicate: true, coupon: null };

  const doc = { ...data, code: data.code.toUpperCase(), createdAt: new Date() };
  const result = await db.collection<CouponDoc>(COLLECTION).insertOne(doc);
  return { duplicate: false, coupon: { ...doc, _id: result.insertedId.toString() } };
}

export async function updateCoupon(id: string, fields: Record<string, unknown>) {
  const { db } = await connectToDatabase();
  const objectId = new ObjectId(id);

  if (fields.code) {
    const dup = await db.collection<CouponDoc>(COLLECTION).findOne({ code: fields.code, _id: { $ne: objectId } });
    if (dup) return { duplicate: true };
  }

  const result = await db.collection<CouponDoc>(COLLECTION).updateOne({ _id: objectId }, { $set: fields });
  return { duplicate: false, matched: result.matchedCount > 0 };
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  const result = await db.collection<CouponDoc>(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    await db.collection(COLLECTION).updateOne({ code: code.toUpperCase() }, { $inc: { usageCount: 1 } });
  } catch {
    // non-critical
  }
}
