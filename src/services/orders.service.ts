import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const COLLECTION = "orders";

export interface OrderData {
  orderId: string;
  customer: { name: string; phone: string; email: string | null };
  delivery: { address: string; city: string };
  items: Array<{ name: string; price: string; image: string; quantity: number }>;
  subtotal: number;
  shipping: number;
  couponCode: string | null;
  couponDiscount: number;
  total: number;
  paymentMethod: string;
  paymentLabel: string;
  status: string;
  currentLocation: string;
  userId?: string;
  createdAt: Date;
}

function serializeOrder(o: Record<string, unknown>) {
  const createdAt = o.createdAt as Date;
  return {
    _id: (o._id as ObjectId).toString(),
    id: (o._id as ObjectId).toString(),
    orderId: o.orderId,
    customer: o.customer,
    delivery: o.delivery,
    items: o.items,
    subtotal: o.subtotal,
    shipping: o.shipping,
    couponCode: o.couponCode || null,
    couponDiscount: o.couponDiscount || 0,
    total: o.total,
    paymentMethod: o.paymentMethod,
    paymentLabel: o.paymentLabel,
    status: o.status,
    currentLocation: o.currentLocation || "",
    createdAt: createdAt ? createdAt.toISOString() : "",
  };
}

export async function createOrder(data: Omit<OrderData, "status" | "currentLocation" | "createdAt">) {
  const { db } = await connectToDatabase();
  const result = await db.collection(COLLECTION).insertOne({
    ...data,
    status: "Placed",
    currentLocation: "",
    createdAt: new Date(),
  });
  return { insertedId: result.insertedId.toString(), orderId: data.orderId };
}

export async function getAllOrders() {
  const { db } = await connectToDatabase();
  const orders = await db
    .collection(COLLECTION)
    .find()
    .sort({ createdAt: -1 })
    .project({ orderId: 1, customer: 1, total: 1, status: 1, paymentLabel: 1, createdAt: 1 })
    .toArray();
  return orders.map(serializeOrder);
}

export async function findOrderById(orderId: string) {
  const { db } = await connectToDatabase();
  return db.collection(COLLECTION).findOne({ orderId });
}

export async function findOrderByIdPublic(orderId: string) {
  const { db } = await connectToDatabase();
  const order = await db.collection(COLLECTION).findOne(
    { orderId },
    { projection: { userId: 0, currentLocation: 0 } }
  );
  return order ? serializeOrder(order) : null;
}

export async function findOrdersByPhone(phone: string) {
  const cleaned = phone.replace(/[\s\-]/g, "");
  if (!cleaned) return [];
  const { db } = await connectToDatabase();
  const orders = await db
    .collection(COLLECTION)
    .find({ "customer.phone": { $regex: cleaned, $options: "i" } })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();
  return orders.map(serializeOrder);
}

export async function updateOrderStatus(id: string, status: string, currentLocation?: string) {
  const { db } = await connectToDatabase();
  const updateFields: Record<string, string> = { status };
  if (typeof currentLocation === "string") updateFields.currentLocation = currentLocation;

  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );
  return result.matchedCount > 0;
}

export async function findOrdersByUserId(userId: string) {
  const { db } = await connectToDatabase();
  const orders = await db
    .collection(COLLECTION)
    .find({ userId })
    .sort({ createdAt: -1 })
    .project({ orderId: 1, customer: 1, total: 1, status: 1, paymentLabel: 1, createdAt: 1 })
    .toArray();
  return orders.map(serializeOrder);
}

export async function attachUserToOrder(orderId: string, userId: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  const result = await db.collection(COLLECTION).updateOne(
    { orderId },
    { $set: { userId } }
  );
  return result.matchedCount > 0;
}
