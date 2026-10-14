"use client";

import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import { useEffect, useMemo, useState } from "react";
import { SquarePen } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { WorkflowChatTransport } from "@ai-sdk/workflow/client";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import type { SearchProductsToolInvocation, ShoppingAgentUIMessage } from "@/lib/agent";
import { AgentProductList } from "./agent-product-list";
import { AgentProductCard } from "./agent-product-card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AgentErrorCard } from "./agent-error-card";
import { AgentEmptyState } from "./agent-empty-state";
import { PhaseGlyph, TileGlyph } from "./art/tiles";
import { promptInputClass } from "./agent-prompt-class";

type SearchedProduct = Extract<
  SearchProductsToolInvocation,
  { state: "output-available" }
>["output"]["products"][number];

function StatusLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-2 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
      <Spinner />
      <span>{children}</span>
    </div>
  );
}

const STARTERS = [
  "Show me hoodies",
  "What's good for a desk setup?",
  "I want to return an order",
];

// True while the assistant is working but hasn't produced anything visible
// yet: before the first chunk arrives, or while it is still reasoning.
function isThinking(
  status: string,
  messages: ShoppingAgentUIMessage[],
): boolean {
  if (status === "submitted") return true;
  if (status !== "streaming") return false;
  const last = messages.at(-1);
  if (last?.role !== "assistant") return true;
  const lastPart = last.parts.at(-1);
  return !lastPart || lastPart.type === "step-start" || lastPart.type === "reasoning";
}

const MESSAGES_KEY = "agent-chat-messages";
const RUN_ID_KEY = "active-workflow-run-id";

// localStorage can be unavailable or throw (private windows, blocked site
// data). The chat then works as before, it just isn't kept across reloads.
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

function readSavedMessages(): ShoppingAgentUIMessage[] {
  try {
    const parsed = JSON.parse(readStorage(MESSAGES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Rendered client-only (see agent-sidebar.tsx), so reading localStorage during
// render can't cause a hydration mismatch.
export function AgentChat() {
  const [input, setInput] = useState("");

  const saved = useMemo(
    () => ({ messages: readSavedMessages(), runId: readStorage(RUN_ID_KEY) ?? undefined }),
    [],
  );
  // Copied into the error details so support can find the run in the logs.
  const [runId, setRunId] = useState(saved.runId);

  const {
    messages,
    setMessages,
    error,
    clearError,
    status,
    stop,
    sendMessage,
    regenerate,
    addToolApprovalResponse,
  } = useChat<ShoppingAgentUIMessage>({
    // Resume the agent once the shopper confirms or cancels a return.
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    // Restore the saved history, then reattach to the run that was streaming
    // when the page was left, if any.
    messages: saved.messages,
    resume: Boolean(saved.runId),
    transport: new WorkflowChatTransport({
      api: "/api/chat",
      onChatSendMessage: (response) => {
        const runId = response.headers.get("x-workflow-run-id");
        if (runId) writeStorage(RUN_ID_KEY, runId);
        setRunId(runId ?? undefined);
      },
      onChatEnd: () => writeStorage(RUN_ID_KEY, null),
      prepareReconnectToStreamRequest: ({ api, ...rest }) => {
        const runId = readStorage(RUN_ID_KEY);
        if (!runId) throw new Error("No active workflow run ID found");
        return { ...rest, api: `/api/chat/${encodeURIComponent(runId)}/stream` };
      },
    }),
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    // Not while streaming: a reload mid-reply resumes the run, which replays the
    // whole reply, so a saved partial reply would show up twice.
    if (status === "streaming") return;
    writeStorage(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages, status]);

  const startNewChat = () => {
    // stop() aborts the stream, so onChatEnd doesn't fire later and clear the
    // run ID of the next chat. The aborted run still finishes on the server.
    stop();
    setMessages([]);
    clearError();
    writeStorage(RUN_ID_KEY, null);
    writeStorage(MESSAGES_KEY, null);
  };

  const sendStarter = (text: string) => {
    if (isBusy) return;
    setRunId(undefined);
    sendMessage({ text });
  };

  const handleSubmit = (message: PromptInputMessage) => {
    if (isBusy || !input.trim()) return;
    // A request that fails before the server responds has no run ID, so clear
    // the previous one rather than report it against the wrong request.
    setRunId(undefined);
    sendMessage({ text: input });
    setInput("");
  };

  const retry = () => {
    setRunId(undefined);
    regenerate();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && !error && (
            <AgentEmptyState
              eyebrow="Ship It Shop Agent"
              title="What are you shipping today?"
              description="Search the catalog, compare products, check stock, or start a return."
              starters={STARTERS}
              onStarter={sendStarter}
              disabled={isBusy}
            />
          )}
          {messages.map((m) => {
            // The agent often runs several searches for one request (e.g. "hat",
            // then the hats category). Merge every successful search in the
            // message into one deduplicated list, shown where the first one was.
            const searchResults = new Map<string, SearchedProduct>();
            let firstSearchIndex = -1;
            m.parts.forEach((p, i) => {
              if (p.type !== "tool-searchProducts" || p.state !== "output-available") return;
              if (p.output.error) return;
              if (firstSearchIndex === -1) firstSearchIndex = i;
              for (const product of p.output.products) {
                if (!searchResults.has(product.id)) searchResults.set(product.id, product);
              }
            });
            return m.parts.map((p, i) => {
              switch (p.type) {
                case "text":
                  return (
                    <Message key={`${m.id}-${i}`} from={m.role}>
                      <MessageContent>
                        <MessageResponse>{p.text}</MessageResponse>
                      </MessageContent>
                    </Message>
                  );
                case "tool-searchProducts":
                  if (p.state !== "output-available") {
                    return <AgentProductList key={`${m.id}-${i}`} invocation={p} />;
                  }
                  // A failed search only matters if no other search found anything.
                  if (p.output.error) {
                    return searchResults.size === 0 ? (
                      <AgentProductList key={`${m.id}-${i}`} invocation={p} />
                    ) : null;
                  }
                  if (i !== firstSearchIndex || searchResults.size === 0) return null;
                  const products = [...searchResults.values()];
                  return (
                    <AgentProductList
                      key={`${m.id}-${i}`}
                      invocation={{ ...p, output: { count: products.length, products } }}
                    />
                  );
                case "tool-getProductDetails":
                  return <AgentProductCard key={`${m.id}-${i}`} invocation={p} />;
                case "tool-getAllCategories":
                  if (p.state === "input-streaming" || p.state === "input-available") {
                    return (
                      <StatusLine key={`${m.id}-${i}`}>Searching the catalog…</StatusLine>
                    );
                  }
                  return null;
                case "tool-returnOrder":
                  if (p.state === "input-streaming" || p.state === "input-available") {
                    return (
                      <StatusLine key={`${m.id}-${i}`}>Preparing your return…</StatusLine>
                    );
                  }
                  if (p.state === "approval-responded" && p.approval.approved) {
                    return <StatusLine key={`${m.id}-${i}`}>Starting your return…</StatusLine>;
                  }
                  if (p.state === "output-denied") {
                    return (
                      <p
                        key={`${m.id}-${i}`}
                        className="my-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                      >
                        Return cancelled.
                      </p>
                    );
                  }
                  if (p.state === "output-error" || (p.state === "output-available" && "error" in p.output)) {
                    const notFound = p.state === "output-available" && p.output.error === "not-found";
                    return (
                      <div
                        key={`${m.id}-${i}`}
                        className="my-2 border border-destructive/60 border-l-4 p-4 text-sm"
                      >
                        <p className="font-medium">
                          {notFound ? "We couldn't find this order" : "We couldn't start this return"}
                        </p>
                        <p className="mt-1 text-muted-foreground">Order {p.input?.orderId}</p>
                      </div>
                    );
                  }
                  if (p.state === "output-available" && "runId" in p.output) {
                    return (
                      <div
                        key={`${m.id}-${i}`}
                        className="my-2 flex gap-3 border border-foreground p-4 text-sm"
                      >
                        <PhaseGlyph phase="full" className="mt-0.5" />
                        <div>
                          <p className="font-medium">Return started for order {p.input.orderId}</p>
                          <p className="mt-1 text-muted-foreground">
                            Status: processing. You'll get a confirmation once it's filed.
                          </p>
                        </div>
                      </div>
                    );
                  }
                  if (p.state === "approval-requested" && !p.approval.isAutomatic) {
                    return (
                      <div
                        key={`${m.id}-${i}`}
                        className="relative my-2 overflow-hidden border border-foreground p-4 text-sm"
                      >
                        <TileGlyph
                          motif="quarter"
                          rotate={90}
                          className="absolute -top-px -right-px size-8"
                        />
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          Confirm return
                        </p>
                        <p className="mt-1 font-medium">Return order {p.input.orderId}?</p>
                        <p className="mt-1 text-muted-foreground">
                          All items in this order will be returned. Reason: {p.input.reason}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            className="rounded-full"
                            onClick={() =>
                              addToolApprovalResponse({ id: p.approval.id, approved: true })
                            }
                          >
                            Confirm return
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full border-foreground"
                            onClick={() =>
                              addToolApprovalResponse({ id: p.approval.id, approved: false })
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                default:
                  return null;
              }
            });
          })}
          {isThinking(status, messages) && <StatusLine>Thinking…</StatusLine>}
          {error && (
            <AgentErrorCard
              error={error}
              audience="shopper"
              agentName="Shopping assistant"
              runId={runId}
              onRetry={retry}
            />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-foreground p-3">
        <PromptInput onSubmit={handleSubmit} className={promptInputClass}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Ask the agent"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={startNewChat}
                disabled={messages.length === 0}
              >
                <SquarePen />
                New chat
              </Button>
            </PromptInputTools>
            <PromptInputSubmit
              status={status}
              onStop={stop}
              disabled={!isBusy && !input.trim()}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}