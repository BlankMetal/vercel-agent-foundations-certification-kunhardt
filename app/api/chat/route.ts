import { createModelCallToUIChunkTransform } from "@ai-sdk/workflow";
import { createUIMessageStreamResponse, type UIMessage } from "ai";
import { start } from "workflow/api";
import { chatFlow } from "@/lib/workflows/chat-flow";

export const POST = async (req: Request) => {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const run = await start(chatFlow, [messages]);

  return createUIMessageStreamResponse({
    stream: run.readable.pipeThrough(createModelCallToUIChunkTransform()),
    // WorkflowChatTransport reads this to reconnect via /api/chat/[id]/stream.
    headers: { "x-workflow-run-id": run.runId },
  });
};
