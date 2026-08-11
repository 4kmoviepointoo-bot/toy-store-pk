import { ObjectId } from "mongodb";

export interface UserDoc {
  _id?: ObjectId;
  name: string;
  email: string | null;
  phone: string;
  passwordHash: string;
  address: string;
  city: string;
  createdAt: Date;
}

export interface SerializedUser {
  _id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  city: string;
  createdAt: string;
}

export function serializeUser(doc: UserDoc): SerializedUser {
  return {
    _id: doc._id?.toString() || "",
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    address: doc.address,
    city: doc.city,
    createdAt: doc.createdAt.toISOString(),
  };
}
