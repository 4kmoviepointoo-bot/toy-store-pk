export type AgeGroup = "0-2 Years" | "3-5 Years" | "6-8 Years" | "9+ Years";

export type Category =
  | "Educational Toys"
  | "Action Figures"
  | "Board Games"
  | "Dolls & Plush"
  | "Vehicles & Remote Control"
  | "Musical Toys"
  | "Building & Construction"
  | "Outdoor & Sports";

export interface Product {
  slug: string;
  name: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviews: number;
  badge: string;
  badgeColor: string;
  image: string;
  description: string;
  isFreeDelivery: boolean;
  ageGroup: AgeGroup;
  category: Category;
  tags: string[];
}

export const AGE_GROUPS: AgeGroup[] = ["0-2 Years", "3-5 Years", "6-8 Years", "9+ Years"];

export const CATEGORIES: Category[] = [
  "Educational Toys",
  "Action Figures",
  "Board Games",
  "Dolls & Plush",
  "Vehicles & Remote Control",
  "Musical Toys",
  "Building & Construction",
  "Outdoor & Sports",
];

export const products: Product[] = [
  {
    slug: "remote-control-racing-car",
    name: "Remote Control Racing Car",
    price: "Rs. 2,499",
    originalPrice: "Rs. 3,299",
    rating: 4.8,
    reviews: 124,
    badge: "Popular",
    badgeColor: "bg-orange text-white",
    image: "/images/remote-control-racing-car.svg",
    description:
      "Zoom into adventure with this high-speed remote control racing car! Featuring vibrant colors, easy-to-use controls, and durable wheels built for indoor and outdoor fun. Perfect for kids who love speed and excitement.",
    isFreeDelivery: false,
    ageGroup: "6-8 Years",
    category: "Vehicles & Remote Control",
    tags: ["remote control", "racing", "car", "vehicle", "speed"],
  },
  {
    slug: "building-blocks-set",
    name: "Building Blocks Set",
    price: "Rs. 1,899",
    originalPrice: "Rs. 2,499",
    rating: 4.9,
    reviews: 98,
    badge: "New",
    badgeColor: "bg-green text-white",
    image: "/images/building-blocks-set.svg",
    description:
      "Unleash your child's imagination with this colorful building blocks set! Includes vibrant blocks in various shapes and sizes for endless creative possibilities. Great for developing spatial awareness and fine motor skills.",
    isFreeDelivery: true,
    ageGroup: "3-5 Years",
    category: "Building & Construction",
    tags: ["building", "blocks", "construction", "creative", "educational"],
  },
  {
    slug: "cute-doll-playset",
    name: "Cute Doll Playset",
    price: "Rs. 1,599",
    originalPrice: "Rs. 2,199",
    rating: 4.7,
    reviews: 87,
    badge: "Popular",
    badgeColor: "bg-orange text-white",
    image: "/images/cute-doll-playset.svg",
    description:
      "Bring stories to life with this adorable doll playset! Features a beautifully dressed doll with a charming playhouse. Encourages imaginative play and storytelling for hours of creative fun.",
    isFreeDelivery: false,
    ageGroup: "3-5 Years",
    category: "Dolls & Plush",
    tags: ["doll", "playset", "imagination", "storytelling", "plush"],
  },
  {
    slug: "kids-musical-toy",
    name: "Kids Musical Toy",
    price: "Rs. 1,299",
    originalPrice: "Rs. 1,799",
    rating: 4.6,
    reviews: 65,
    badge: "New",
    badgeColor: "bg-green text-white",
    image: "/images/kids-musical-toy.svg",
    description:
      "Spark a love for music with this colorful kids' musical toy! Features bright keys, fun sounds, and a built-in drum for rhythmic play. Perfect for introducing little ones to the joy of music.",
    isFreeDelivery: true,
    ageGroup: "0-2 Years",
    category: "Musical Toys",
    tags: ["musical", "instrument", "piano", "drum", "sound"],
  },
  {
    slug: "strategy-board-game",
    name: "Strategy Board Game",
    price: "Rs. 2,199",
    originalPrice: "Rs. 2,999",
    rating: 4.8,
    reviews: 56,
    badge: "Bestseller",
    badgeColor: "bg-purple text-white",
    image: "/images/remote-control-racing-car.svg",
    description:
      "Challenge your mind with this exciting strategy board game! Features multiple game modes, colorful pieces, and a beautifully designed board. Perfect for family game nights and developing critical thinking skills.",
    isFreeDelivery: false,
    ageGroup: "9+ Years",
    category: "Board Games",
    tags: ["board game", "strategy", "family", "puzzle", "critical thinking"],
  },
  {
    slug: "action-hero-figure",
    name: "Action Hero Figure",
    price: "Rs. 1,799",
    originalPrice: "Rs. 2,399",
    rating: 4.5,
    reviews: 72,
    badge: "Trending",
    badgeColor: "bg-cyan text-white",
    image: "/images/cute-doll-playset.svg",
    description:
      "Unleash epic adventures with this detailed action hero figure! Features realistic articulation, interchangeable accessories, and durable construction. Perfect for collectors and imaginative play.",
    isFreeDelivery: false,
    ageGroup: "6-8 Years",
    category: "Action Figures",
    tags: ["action figure", "hero", "adventure", "collectible", "poseable"],
  },
  {
    slug: "outdoor-sports-set",
    name: "Outdoor Sports Set",
    price: "Rs. 3,499",
    originalPrice: "Rs. 4,499",
    rating: 4.7,
    reviews: 43,
    badge: "Premium",
    badgeColor: "bg-pink text-white",
    image: "/images/building-blocks-set.svg",
    description:
      "Get active with this comprehensive outdoor sports set! Includes cricket bat, football, badminton rackets, and more. Perfect for developing physical skills and enjoying outdoor adventures.",
    isFreeDelivery: true,
    ageGroup: "9+ Years",
    category: "Outdoor & Sports",
    tags: ["outdoor", "sports", "cricket", "football", "active"],
  },
  {
    slug: "toddler-learning-tablet",
    name: "Toddler Learning Tablet",
    price: "Rs. 1,499",
    originalPrice: "Rs. 1,999",
    rating: 4.6,
    reviews: 89,
    badge: "New",
    badgeColor: "bg-green text-white",
    image: "/images/kids-musical-toy.svg",
    description:
      "Introduce your toddler to learning with this interactive educational tablet! Features alphabet, numbers, shapes, and colors with fun sound effects. Perfect for early childhood development.",
    isFreeDelivery: false,
    ageGroup: "0-2 Years",
    category: "Educational Toys",
    tags: ["tablet", "educational", "learning", "alphabet", "numbers"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function parsePrice(price: string): number {
  return Number(price.replace(/[^\d]/g, ""));
}
