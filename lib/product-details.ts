import { getProductById, getProducts, getProductStock } from "@/lib/api";
import type { Product } from "@/lib/types";

// Shared by the agent tools (lib/tools.ts) and the chat's expandable product
// rows (lib/product-actions.ts). Server-only: lib/api.ts reads the bypass secret.

// Live stock for a product, or null if it couldn't be checked. A stock failure
// shouldn't hide the product itself. There is no batch stock endpoint for
// shoppers, so lists fetch one per product (at most 10, in parallel).
export async function liveStock(id: string) {
  try {
    const s = await getProductStock(id);
    return { inStock: s.inStock, lowStock: s.lowStock, quantity: s.stock };
  } catch {
    return null;
  }
}

export async function withStock<T extends { id: string }>(items: T[]) {
  const stock = await Promise.all(items.map((p) => liveStock(p.id)));
  return items.map((p, i) => ({ ...p, stock: stock[i] }));
}

export function toSummary(p: Product) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.images[0],
    price: p.price,
    currency: p.currency,
  };
}

// Full details for one product: fresh product data, live stock, and up to 3
// products from the same category. Throws ApiRequestError if the product
// can't be loaded.
export async function loadProductDetails(id: string, catalog?: Product[]) {
  const [product, stock, allProducts] = await Promise.all([
    getProductById(id),
    liveStock(id),
    // The full catalog is ~30 products and cached for 5 minutes (lib/api.ts).
    catalog ?? getProducts({ limit: 100 }),
  ]);
  return {
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
      images: product.images,
      tags: product.tags,
      featured: product.featured,
      // Not useful to the agent, but it makes this a full Product, which the
      // card's Add to cart button passes to the cart provider.
      createdAt: product.createdAt,
    },
    // null means stock couldn't be checked, not that it is out of stock.
    stock,
    related: allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3)
      .map(toSummary),
  };
}

export type ProductDetailsData = Awaited<ReturnType<typeof loadProductDetails>>;
