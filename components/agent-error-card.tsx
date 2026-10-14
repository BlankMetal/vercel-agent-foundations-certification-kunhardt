"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, Copy, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Audience = "shopper" | "staff";
type ErrorKind = "auth" | "rate-limit" | "network" | "server";

// WorkflowChatTransport throws `Failed to fetch chat: <status> <body>` for a
// non-2xx response. A dropped connection surfaces as the browser's fetch
// TypeError, whose message differs per browser.
function classify(error: Error): { kind: ErrorKind; status?: number } {
  const match = error.message.match(/^Failed to fetch chat: (\d{3})/);
  const status = match ? Number(match[1]) : undefined;
  if (status === 401 || status === 403) return { kind: "auth", status };
  if (status === 429) return { kind: "rate-limit", status };
  if (
    error.name === "TypeError" &&
    /failed to fetch|load failed|networkerror/i.test(error.message)
  ) {
    return { kind: "network" };
  }
  return { kind: "server", status };
}

const COPY: Record<Audience, Record<ErrorKind, { title: string; body: string }>> = {
  shopper: {
    auth: {
      title: "Your session has expired",
      body: "Reload the page and try again.",
    },
    "rate-limit": {
      title: "Too many requests",
      body: "Wait a moment, then try again.",
    },
    network: {
      title: "Couldn't reach the store",
      body: "Check your connection, then try again.",
    },
    server: {
      title: "Something went wrong on our side",
      body: "Try again. If it keeps happening, copy the details and include them when you contact support.",
    },
  },
  staff: {
    auth: {
      title: "Your admin session has expired",
      body: "Sign in again, then retry your question.",
    },
    "rate-limit": {
      title: "Rate limited",
      body: "The agent is getting too many requests. Wait a moment, then retry.",
    },
    network: {
      title: "Couldn't reach the server",
      body: "Check your connection, then retry.",
    },
    server: {
      title: "The agent hit an error",
      body: "Retry the question. If it keeps failing, copy the details and send them to support.",
    },
  },
};

export function AgentErrorCard({
  error,
  audience,
  agentName,
  runId,
  onRetry,
}: {
  error: Error;
  audience: Audience;
  agentName: string;
  /** Workflow run ID of the failed request, when the server returned one. */
  runId?: string;
  onRetry: () => void;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const { kind, status } = classify(error);
  const { title, body } = COPY[audience][kind];

  const copyDetails = async () => {
    const details = [
      `Agent: ${agentName}`,
      `Time: ${new Date().toISOString()}`,
      `Page: ${window.location.pathname}`,
      `Run ID: ${runId ?? "none"}`,
      `HTTP status: ${status ?? "none"}`,
      `Error: ${error.message}`,
    ].join("\n");
    try {
      // Throws in insecure contexts or when the page lacks clipboard permission.
      await navigator.clipboard.writeText(details);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2000);
  };

  return (
    <Alert variant="destructive" className="my-2">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{body}</p>
        {audience === "staff" && (
          <p className="line-clamp-2 break-all font-mono text-xs">{error.message}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {kind === "auth" && audience === "staff" ? (
            <Button asChild size="sm">
              <Link href="/admin/login">Sign in again</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={onRetry}>
              <RotateCcw aria-hidden="true" />
              Try again
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={copyDetails}>
            {copyState === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copyState === "copied"
              ? "Copied"
              : copyState === "failed"
                ? "Couldn't copy"
                : "Copy error details"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
