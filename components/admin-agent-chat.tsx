"use client";

import { useEffect, useState } from "react";
import type { UIMessage } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "./ai-elements/message";
import { useChat } from "@ai-sdk/react";
import { WorkflowChatTransport } from "@ai-sdk/workflow/client";
import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AgentErrorCard } from "./agent-error-card";
import { AgentEmptyState } from "./agent-empty-state";
import { promptInputClass } from "./agent-prompt-class";

const SUGGESTIONS = [
  "Show me low-stock items",
  "What were yesterday's top sellers?",
  "Summarize this week's revenue",
];

const TOOL_LABELS: Record<string, string> = {
  "tool-getSalesAnalytics": "Checking sales…",
  "tool-getReturnsHistory": "Checking returns…",
  "tool-getInventoryStock": "Checking inventory…",
  "tool-getSupportTickets": "Checking support tickets…",
  "tool-searchProducts": "Searching the catalog…",
  "tool-getAllCategories": "Searching the catalog…",
  "tool-bash": "Crunching the numbers…",
};

// Tool parts aren't rendered, so without this the panel sits blank while the
// agent runs several lookups before its first sentence.
function workingLabel(status: string, messages: UIMessage[]): string | null {
  if (status === "submitted") return "Thinking…";
  if (status !== "streaming") return null;
  const last = messages.at(-1);
  if (last?.role !== "assistant") return "Thinking…";
  const lastPart = last.parts.at(-1);
  if (lastPart?.type === "text") return null;
  return (lastPart && TOOL_LABELS[lastPart.type]) ?? "Thinking…";
}

export function AdminAgentChat({
  conversationId,
  initialMessages,
  onMessagesChange,
  onBusyChange,
  onNewChat,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
  /** Must be stable (useCallback); it runs from an effect. */
  onMessagesChange: (conversationId: string, messages: UIMessage[]) => void;
  /** Must be stable (useCallback); it runs from an effect. */
  onBusyChange: (busy: boolean) => void;
  onNewChat: () => void;
}) {
  const [input, setInput] = useState("");
  // Copied into the error details so support can find the run in the logs.
  const [runId, setRunId] = useState<string | undefined>();

  const { messages, error, status, stop, sendMessage, regenerate } = useChat({
    id: conversationId,
    messages: initialMessages,
    // we need to point to a different API route because this is a different agent
    transport: new WorkflowChatTransport({
      api: "/api/admin/chat",
      onChatSendMessage: (response) => {
        setRunId(response.headers.get("x-workflow-run-id") ?? undefined);
      },
    }),
  });

  const isBusy = status === "submitted" || status === "streaming";
  const label = workingLabel(status, messages);

  useEffect(() => {
    // Skip mid-stream: the reply is incomplete and changes on every chunk. Skip
    // errors too: the failed reply can hold tool calls with no result, and
    // sending those back to the model later fails. The user's message was
    // already saved when it was submitted.
    if (status === "streaming" || status === "error") return;
    onMessagesChange(conversationId, messages);
  }, [conversationId, messages, status, onMessagesChange]);

  useEffect(() => onBusyChange(isBusy), [isBusy, onBusyChange]);

  // A request that fails before the server responds has no run ID, so clear
  // the previous one rather than report it against the wrong request.
  const send = (text: string) => {
    if (isBusy || !text.trim()) return false;
    setRunId(undefined);
    sendMessage({ text });
    return true;
  };

  const handleSubmit = (message: PromptInputMessage) => {
    // Enter still submits while the agent is busy; keep the draft if it's refused.
    if (send(input)) setInput("");
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
              eyebrow="Store admin agent"
              title="Run the shop from here."
              description="Ask about sales, returns, inventory, or support tickets. The agent can crunch numbers in a sandbox."
            />
          )}
          {messages.map((m) =>
            m.parts.map((p, i) => {
              switch (p.type) {
                case "text":
                  return (
                    <Message key={`${m.id}-${i}`} from={m.role}>
                      <MessageContent>
                        <MessageResponse>{p.text}</MessageResponse>
                      </MessageContent>
                    </Message>
                  );
                case "tool-bash": {
                  const input = p.input as { command?: string } | undefined;
                  const output = p.output as
                    | { stdout?: string; stderr?: string }
                    | undefined;
                  return (
                    <div
                      key={`${m.id}-${i}`}
                      className="my-2 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-sm shadow-[4px_4px_0_0_var(--foreground)]"
                    >
                      <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-400">
                        <span aria-hidden="true" className="flex gap-1">
                          <span className="size-2 rounded-full bg-neutral-100" />
                          <span className="size-2 rounded-full border border-neutral-500" />
                          <span className="size-2 rounded-full border border-neutral-700" />
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em]">
                          {p.state === "output-available"
                            ? "Terminal"
                            : "Running…"}
                        </span>
                      </div>
                      <div className="px-3 py-2">
                        <div className="text-neutral-100 font-semibold">
                          $ {input?.command}
                        </div>
                        {p.state === "output-available" && output && (
                          <div className="mt-1 text-neutral-300">
                            {output.stdout && (
                              <pre className="whitespace-pre-wrap">
                                {output.stdout}
                              </pre>
                            )}
                            {output.stderr && (
                              <pre className="whitespace-pre-wrap text-red-400">
                                {output.stderr}
                              </pre>
                            )}
                          </div>
                        )}
                        {p.state !== "output-available" && (
                          <div className="mt-1 flex items-center gap-1 text-neutral-500">
                            <span className="animate-pulse">▊</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                default:
                  return null;
              }
            }),
          )}
          {label && (
            <div className="my-2 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <Spinner />
              <span>{label}</span>
            </div>
          )}
          {error && (
            <AgentErrorCard
              error={error}
              audience="staff"
              agentName="Store admin agent"
              runId={runId}
              onRetry={retry}
            />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="flex flex-col gap-3 border-t border-foreground p-3">
        <Suggestions>
          {SUGGESTIONS.map((s) => (
            <Suggestion
              key={s}
              suggestion={s}
              onClick={send}
              disabled={isBusy}
              className="border-foreground font-mono text-[11px] tracking-[0.04em] hover:bg-foreground hover:text-background"
            />
          ))}
        </Suggestions>
        <PromptInput onSubmit={handleSubmit} className={promptInputClass}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Ask the admin agent…"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onNewChat}
                // Switching mid-reply would unmount this chat and drop the reply.
                disabled={isBusy || messages.length === 0}
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
