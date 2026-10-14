import { createModelCallToUIChunkTransform } from "@ai-sdk/workflow";
import { createUIMessageStreamResponse } from "ai";
import { getRun } from "workflow/api";

// Reconnects WorkflowChatTransport to an existing chat run, e.g. after a
// dropped connection or a function timeout mid-stream.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  // startIndex counts UI chunks the client already has. The run's stream holds
  // raw model-call parts, which don't map one-to-one to UI chunks, so replay
  // the run from 0 and let the transform skip what was already sent. The
  // transform requires a non-negative integer, so anything else falls back to 0.
  const startIndexParam = Number.parseInt(searchParams.get("startIndex") ?? "", 10);
  const uiStartIndex = Number.isSafeInteger(startIndexParam) && startIndexParam > 0 ? startIndexParam : 0;

  const run = await getRun(id);
  const readable = run
    .getReadable({ startIndex: 0 })
    .pipeThrough(createModelCallToUIChunkTransform({ uiStartIndex }));

  return createUIMessageStreamResponse({ stream: readable });
}
