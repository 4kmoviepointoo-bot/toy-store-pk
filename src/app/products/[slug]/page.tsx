import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import { getProductBySlugFromDb, formatPrice } from "@/lib/seedProducts";
import { ProductDetail } from "./ProductDetail";

const SITE_URL = "https://toyverse.pk";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const dbProduct = await getProductBySlugFromDb(slug);

  if (dbProduct) {
    const price = formatPrice(dbProduct.price);
    const originalPrice = formatPrice(dbProduct.originalPrice);
    const savings = dbProduct.originalPrice - dbProduct.price;
    const discountPercent = Math.round((1 - dbProduct.price / dbProduct.originalPrice) * 100);

    const title = `${dbProduct.name} - ${price}`;
    const desc = dbProduct.description.slice(0, 160);
    const description = `Buy ${dbProduct.name} for ${price} (was ${originalPrice}) at ToyVerse Pakistan. Save Rs. ${savings.toLocaleString()} (${discountPercent}% off). ${desc}... Shop now with cash on delivery across Pakistan.`;

    const imageUrl = `${SITE_URL}${dbProduct.image}`;

    return {
      title,
      description,
      keywords: [
        dbProduct.name,
        "toy store Pakistan",
        "kids toys",
        "buy toys online Pakistan",
        "cash on delivery toys",
        "premium toys",
        dbProduct.category,
        dbProduct.ageGroup,
      ],
      openGraph: {
        title: `${dbProduct.name} - ${price}`,
        description: dbProduct.description,
        url: `${SITE_URL}/products/${dbProduct.slug}`,
        siteName: "ToyVerse Pakistan",
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: `${dbProduct.name} — ToyVerse Pakistan`,
          },
        ],
        locale: "en_PK",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${dbProduct.name} - ${price}`,
        description: dbProduct.description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `/products/${dbProduct.slug}`,
      },
    };
  }

  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you're looking for doesn't exist. Browse our collection of premium toys for kids in Pakistan.",
    };
  }

  const price = product.price;
  const originalPrice = product.originalPrice;
  const savings = parseInt(originalPrice.replace(/[^0-9]/g, "")) - parseInt(price.replace(/[^0-9]/g, ""));
  const discountPercent = Math.round((1 - parseInt(price.replace(/[^0-9]/g, "")) / parseInt(originalPrice.replace(/[^0-9]/g, ""))) * 100);

  const title = `${product.name} - ${price}`;
  const description = `Buy ${product.name} for ${price} (was ${originalPrice}) at ToyVerse Pakistan. Save ${savings} PKR (${discountPercent}% off). ${product.description.slice(0, 160)}... Shop now with cash on delivery across Pakistan.`;

  const imageUrl = `${SITE_URL}${product.image}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      "toy store Pakistan",
      "kids toys",
      "buy toys online Pakistan",
      "cash on delivery toys",
      "premium toys",
      product.badge === "Popular" ? "popular toys" : "new toys",
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${product.slug}`,
      siteName: "ToyVerse Pakistan",
      images: [
        {
          url: imageUrl,
          width: 400,
          height: 400,
          alt: `${product.name} — ToyVerse Pakistan`,
        },
      ],
      locale: "en_PK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/products/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
