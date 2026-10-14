import { WorkflowAgent, type ModelCallStreamPart } from "@ai-sdk/workflow";
import { getWritable } from "workflow";
import {
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { searchProducts, getAllCategories, returnOrder, getProductDetails } from "@/lib/tools";
import { instructions } from "@/lib/agent-instructions";

export async function chatFlow(messages: UIMessage[]) {
  "use workflow";

  const modelMessages = await convertToModelMessages(messages);

  const agent = new WorkflowAgent({
    model: "anthropic/claude-sonnet-5.5",
    instructions,
    tools: { searchProducts, getAllCategories, returnOrder, getProductDetails },
  });

  await agent.stream({
    messages: modelMessages,
    writable: getWritable<ModelCallStreamPart>(),
  });
}