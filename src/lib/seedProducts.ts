import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const COLLECTION = "products";

const SEED_PRODUCTS = [
  {
    name: "Remote Control Racing Car",
    slug: "remote-control-racing-car",
    price: 2499,
    originalPrice: 3299,
    category: "Vehicles & Remote Control",
    image: "/images/remote-control-racing-car.svg",
    description:
      "Zoom into adventure with this high-speed remote control racing car! Featuring vibrant colors, easy-to-use controls, and durable wheels built for indoor and outdoor fun. Perfect for kids who love speed and excitement.",
    highlights: [
      "High-speed remote control operation",
      "Vibrant colors and easy-to-use controls",
      "Durable wheels for indoor and outdoor fun",
      "Perfect for kids who love speed",
    ],
    brand: "ToyVerse",
    material: "ABS Plastic",
    pieces: "1 Pc",
    ageRange: "6+ Years",
    stock: 25,
    badge: "Popular",
    isFreeDelivery: false,
    ageGroup: "6-8 Years",
    tags: ["remote control", "racing", "car", "vehicle", "speed"],
    rating: 4.8,
    reviews: 124,
  },
  {
    name: "Building Blocks Set",
    slug: "building-blocks-set",
    price: 1899,
    originalPrice: 2499,
    category: "Building & Construction",
    image: "/images/building-blocks-set.svg",
    description:
      "Unleash your child's imagination with this colorful building blocks set! Includes vibrant blocks in various shapes and sizes for endless creative possibilities. Great for developing spatial awareness and fine motor skills.",
    highlights: [
      "Encourages creativity and imagination",
      "Safe and non-toxic material",
      "Improves hand-eye coordination",
      "Ideal for kids above 3 years",
    ],
    brand: "ToyVerse",
    material: "ABS Plastic",
    pieces: "120 Pcs",
    ageRange: "3+ Years",
    stock: 40,
    badge: "New",
    isFreeDelivery: true,
    ageGroup: "3-5 Years",
    tags: ["building", "blocks", "construction", "creative", "educational"],
    rating: 4.9,
    reviews: 98,
  },
  {
    name: "Cute Doll Playset",
    slug: "cute-doll-playset",
    price: 1599,
    originalPrice: 2199,
    category: "Dolls & Plush",
    image: "/images/cute-doll-playset.svg",
    description:
      "Bring stories to life with this adorable doll playset! Features a beautifully dressed doll with a charming playhouse. Encourages imaginative play and storytelling for hours of creative fun.",
    highlights: [
      "Beautifully dressed doll included",
      "Charming playhouse accessory",
      "Encourages imaginative play",
      "Hours of creative storytelling",
    ],
    brand: "ToyVerse",
    material: "Plush & Fabric",
    pieces: "3 Pcs",
    ageRange: "3+ Years",
    stock: 30,
    badge: "Popular",
    isFreeDelivery: false,
    ageGroup: "3-5 Years",
    tags: ["doll", "playset", "imagination", "storytelling", "plush"],
    rating: 4.7,
    reviews: 87,
  },
  {
    name: "Kids Musical Toy",
    slug: "kids-musical-toy",
    price: 1299,
    originalPrice: 1799,
    category: "Musical Toys",
    image: "/images/kids-musical-toy.svg",
    description:
      "Spark a love for music with this colorful kids' musical toy! Features bright keys, fun sounds, and a built-in drum for rhythmic play. Perfect for introducing little ones to the joy of music.",
    highlights: [
      "Bright keys with fun sounds",
      "Built-in drum for rhythmic play",
      "Colorful and engaging design",
      "Introduces kids to music",
    ],
    brand: "ToyVerse",
    material: "ABS Plastic",
    pieces: "1 Pc",
    ageRange: "0-2 Years",
    stock: 35,
    badge: "New",
    isFreeDelivery: true,
    ageGroup: "0-2 Years",
    tags: ["musical", "instrument", "piano", "drum", "sound"],
    rating: 4.6,
    reviews: 65,
  },
  {
    name: "Strategy Board Game",
    slug: "strategy-board-game",
    price: 2199,
    originalPrice: 2999,
    category: "Board Games",
    image: "/images/remote-control-racing-car.svg",
    description:
      "Challenge your mind with this exciting strategy board game! Features multiple game modes, colorful pieces, and a beautifully designed board. Perfect for family game nights and developing critical thinking skills.",
    highlights: [
      "Multiple game modes available",
      "Colorful pieces and designed board",
      "Develops critical thinking skills",
      "Perfect for family game nights",
    ],
    brand: "ToyVerse",
    material: "Cardboard & Plastic",
    pieces: "50+ Pcs",
    ageRange: "9+ Years",
    stock: 20,
    badge: "Best Seller",
    isFreeDelivery: false,
    ageGroup: "9+ Years",
    tags: ["board game", "strategy", "family", "puzzle", "critical thinking"],
    rating: 4.8,
    reviews: 56,
  },
  {
    name: "Action Hero Figure",
    slug: "action-hero-figure",
    price: 1799,
    originalPrice: 2399,
    category: "Action Figures",
    image: "/images/cute-doll-playset.svg",
    description:
      "Unleash epic adventures with this detailed action hero figure! Features realistic articulation, interchangeable accessories, and durable construction. Perfect for collectors and imaginative play.",
    highlights: [
      "Realistic articulation and poseable",
      "Interchangeable accessories included",
      "Durable construction for play",
      "Perfect for collectors",
    ],
    brand: "ToyVerse",
    material: "ABS Plastic",
    pieces: "1 Pc + Accessories",
    ageRange: "6+ Years",
    stock: 45,
    badge: "Popular",
    isFreeDelivery: false,
    ageGroup: "6-8 Years",
    tags: ["action figure", "hero", "adventure", "collectible", "poseable"],
    rating: 4.5,
    reviews: 72,
  },
  {
    name: "Outdoor Sports Set",
    slug: "outdoor-sports-set",
    price: 3499,
    originalPrice: 4499,
    category: "Outdoor & Sports",
    image: "/images/building-blocks-set.svg",
    description:
      "Get active with this comprehensive outdoor sports set! Includes cricket bat, football, badminton rackets, and more. Perfect for developing physical skills and enjoying outdoor adventures.",
    highlights: [
      "Cricket bat, football, and rackets included",
      "Develops physical skills",
      "Perfect for outdoor adventures",
      "Comprehensive sports collection",
    ],
    brand: "ToyVerse",
    material: "Mixed Materials",
    pieces: "6+ Pcs",
    ageRange: "9+ Years",
    stock: 15,
    badge: "Premium",
    isFreeDelivery: true,
    ageGroup: "9+ Years",
    tags: ["outdoor", "sports", "cricket", "football", "active"],
    rating: 4.7,
    reviews: 43,
  },
  {
    name: "Toddler Learning Tablet",
    slug: "toddler-learning-tablet",
    price: 1499,
    originalPrice: 1999,
    category: "Educational Toys",
    image: "/images/kids-musical-toy.svg",
    description:
      "Introduce your toddler to learning with this interactive educational tablet! Features alphabet, numbers, shapes, and colors with fun sound effects. Perfect for early childhood development.",
    highlights: [
      "Interactive alphabet and numbers learning",
      "Fun shapes and colors activities",
      "Engaging sound effects",
      "Perfect for early childhood development",
    ],
    brand: "ToyVerse",
    material: "ABS Plastic",
    pieces: "1 Pc",
    ageRange: "0-2 Years",
    stock: 50,
    badge: "New",
    isFreeDelivery: false,
    ageGroup: "0-2 Years",
    tags: ["tablet", "educational", "learning", "alphabet", "numbers"],
    rating: 4.6,
    reviews: 89,
  },
];

export async function seedProductsIfNeeded(): Promise<boolean> {
  const { db } = await connectToDatabase();
  const count = await db.collection(COLLECTION).countDocuments();

  if (count > 0) return false;

  const now = new Date();
  const docs = SEED_PRODUCTS.map((p) => ({
    ...p,
    createdAt: now,
    updatedAt: now,
  }));

  await db.collection(COLLECTION).insertMany(docs);
  console.log(`[Seed] Seeded ${docs.length} products into MongoDB`);
  return true;
}

export function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString()}`;
}

export function getBadgeColor(badge: string): string {
  switch (badge.toLowerCase()) {
    case "new":
      return "bg-green text-white";
    case "popular":
      return "bg-orange text-white";
    case "best seller":
      return "bg-purple text-white";
    case "premium":
      return "bg-pink text-white";
    case "trending":
      return "bg-cyan text-white";
    case "sale":
      return "bg-red-500 text-white";
    default:
      return "bg-surface-light text-text-secondary";
  }
}

export interface DbProduct {
  _id: ObjectId;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  description: string;
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

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const { db } = await connectToDatabase();
    const docs = await db
      .collection(COLLECTION)
      .find()
      .project({ slug: 1 })
      .toArray();
    return docs.map((d) => d.slug as string).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getProductBySlugFromDb(slug: string): Promise<DbProduct | null> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    // Try slug lookup first
    let doc = await collection.findOne({ slug });
    if (doc) return doc as unknown as DbProduct;

    // Fallback: try _id lookup if the slug looks like a valid ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(slug)) {
      try {
        const { ObjectId } = await import("mongodb");
        doc = await collection.findOne({ _id: new ObjectId(slug) });
        if (doc) return doc as unknown as DbProduct;
      } catch {
        // Invalid ObjectId, ignore
      }
    }

    return null;
  } catch (err) {
    console.error("[Products] Failed to fetch product by slug:", err);
    return null;
  }
}
