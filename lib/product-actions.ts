"use server";

import { loadProductDetails, type ProductDetailsData } from "@/lib/product-details";

// Loads the full card for a product row the shopper expands in the chat.
// Search results only carry what the row shows (one image, no tags or
// related products), so the rest is fetched on demand.
export async function getProductDetailsAction(id: string): Promise<ProductDetailsData> {
  return loadProductDetails(id);
}
