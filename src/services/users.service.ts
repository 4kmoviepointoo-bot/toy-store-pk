import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { UserDoc } from "@/models/User";

const COLLECTION = "users";

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const { db } = await connectToDatabase();
  return db.collection<UserDoc>(COLLECTION).findOne({ email });
}

export async function findUserByPhone(phone: string): Promise<UserDoc | null> {
  const { db } = await connectToDatabase();
  return db.collection<UserDoc>(COLLECTION).findOne({ phone });
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  const { db } = await connectToDatabase();
  return db.collection<UserDoc>(COLLECTION).findOne(
    { _id: new ObjectId(id) },
    { projection: { passwordHash: 0 } }
  );
}

export async function createUser(data: Omit<UserDoc, "_id" | "createdAt">): Promise<ObjectId> {
  const { db } = await connectToDatabase();
  const result = await db.collection<UserDoc>(COLLECTION).insertOne({
    ...data,
    createdAt: new Date(),
  });
  return result.insertedId;
}
