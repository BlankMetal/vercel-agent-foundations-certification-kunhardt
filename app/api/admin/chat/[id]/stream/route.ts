// WorkflowChatTransport reconnects to `${api}/${runId}/stream`, so the admin
// chat needs its own copy of this route. The handler is the same as the
// shopper's; proxy.ts gates this path with the admin cookie.
export { GET } from "@/app/api/chat/[id]/stream/route";
