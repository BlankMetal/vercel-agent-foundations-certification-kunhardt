import {
  ToolLoopAgent,
  type InferAgentUIMessage,
  type UIToolInvocation,
} from "ai";
import { searchProducts, getProductDetails, getAllCategories, returnOrder } from "@/lib/tools";
import { instructions } from "@/lib/agent-instructions";

export const shoppingAgent = new ToolLoopAgent({
  model: "anthropic/claude-sonnet-5.5",
  instructions,
  tools: { searchProducts, getProductDetails, getAllCategories, returnOrder },
});

export type ShoppingAgentUIMessage = InferAgentUIMessage<typeof shoppingAgent>;
export type SearchProductsToolInvocation = UIToolInvocation<typeof searchProducts>;
export type ProductDetailsToolInvocation = UIToolInvocation<typeof getProductDetails>;
