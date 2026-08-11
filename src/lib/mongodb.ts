import { MongoClient, type Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/toyverse";
const MONGODB_DB = process.env.MONGODB_DB || "toyverse";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let reconnectAttempt = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_DELAY_MS = 1000;

export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConnectionError";
  }
}

function getBackoffDelay(attempt: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt), 30000);
}

async function connectWithRetry(): Promise<MongoClient> {
  let attempt = 0;

  while (attempt <= MAX_RECONNECT_ATTEMPTS) {
    let client: MongoClient | null = null;
    try {
      client = await MongoClient.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });

      await client.db(MONGODB_DB).command({ ping: 1 });

      if (attempt > 0) {
        console.log(`[MongoDB] Reconnected after ${attempt} attempt(s)`);
      } else {
        console.log("[MongoDB] Connected to Cloud Database successfully");
      }

      reconnectAttempt = 0;
      return client;
    } catch (err) {
      if (client) {
        client.close().catch(() => {});
      }

      attempt++;
      reconnectAttempt = attempt;

      if (attempt > MAX_RECONNECT_ATTEMPTS) {
        throw err;
      }

      const delay = getBackoffDelay(attempt - 1);
      console.warn(
        `[DB Warning] Connection lost, retrying in ${delay}ms... (attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Exhausted all reconnection attempts");
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    try {
      await cachedClient.db(MONGODB_DB).command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch {
      cachedClient = null;
      cachedDb = null;
      console.warn("[DB Warning] Cached connection stale, reconnecting...");
    }
  }

  try {
    const client = await connectWithRetry();
    cachedClient = client;
    cachedDb = client.db(MONGODB_DB);

    await ensureIndexes(cachedDb);

    return { client, db: cachedDb };
  } catch (error) {
    cachedClient = null;
    cachedDb = null;
    console.error("[MongoDB] All connection attempts failed:", error);
    throw new DatabaseConnectionError(
      "Database unavailable. Please check your connection and try again."
    );
  }
}

let indexesEnsured = false;

async function ensureIndexes(db: Db): Promise<void> {
  if (indexesEnsured) return;

  try {
    await Promise.all([
      db.collection("users").createIndex({ email: 1 }, { sparse: true }),
      db.collection("users").createIndex({ phone: 1 }, { sparse: true }),
      db.collection("orders").createIndex({ orderId: 1 }),
      db.collection("orders").createIndex({ userId: 1, createdAt: -1 }),
      db.collection("reviews").createIndex({ productId: 1, createdAt: -1 }),
      db.collection("coupons").createIndex({ code: 1 }),
      db.collection("settings").createIndex({ key: 1 }),
    ]);
    indexesEnsured = true;
    console.log("[MongoDB] Indexes ensured");
  } catch (err) {
    console.error("[MongoDB] Failed to create indexes:", err);
  }
}
