"use client";

import { ChevronLeft, ChevronRight, SquarePen, Trash2 } from "lucide-react";
import type { AdminConversation } from "@/lib/admin-chat-history";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// The pull tab on the drawer's edge. The closed rail and the open drawer use
// the same shape so it reads as one handle that moves with the drawer.
const TAB =
  "flex h-14 w-5 items-center justify-center rounded-r-md border border-l-0 bg-background text-muted-foreground shadow-sm transition-colors [&_svg]:size-4";

const relativeTime = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

function formatUpdated(timestamp: number) {
  const minutes = Math.round((timestamp - Date.now()) / 60_000);
  if (minutes > -1) return "Just now";
  if (minutes > -60) return relativeTime.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relativeTime.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (days > -7) return relativeTime.format(days, "day");
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function AdminChatHistorySheet({
  open,
  onOpenChange,
  conversations,
  activeId,
  busy,
  onSelect,
  onNew,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: AdminConversation[];
  activeId: string;
  /** Switching unmounts the chat and drops a reply that's still streaming. */
  busy: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      {!open && (
        // The drawer's edge, peeking out from under the header. Only the strip
        // and the tab take clicks, so the rest of the left margin stays usable.
        <button
          type="button"
          aria-label="Open chat history"
          onClick={() => onOpenChange(true)}
          className="group fixed inset-y-0 left-0 z-40 w-2 border-r bg-muted transition-[width] hover:w-3 focus-visible:w-3 focus-visible:outline-none motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            className={cn(
              TAB,
              "absolute top-1/2 left-full -translate-y-1/2 group-hover:bg-muted group-hover:text-foreground group-focus-visible:ring-2 group-focus-visible:ring-ring",
            )}
          >
            <ChevronRight />
          </span>
        </button>
      )}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="gap-0 p-0">
          <button
            type="button"
            aria-label="Close chat history"
            onClick={() => onOpenChange(false)}
            className={cn(
              TAB,
              "absolute top-1/2 left-full -translate-y-1/2 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            <ChevronLeft />
          </button>
          <SheetHeader className="border-b">
            <SheetTitle>Chat history</SheetTitle>
            <SheetDescription>Saved in this browser only.</SheetDescription>
          </SheetHeader>

          <div className="border-b p-3">
            <Button
              className="w-full"
              size="sm"
              onClick={onNew}
              disabled={busy}
            >
              <SquarePen aria-hidden="true" />
              New chat
            </Button>
            {busy && (
              <p className="mt-2 text-xs text-muted-foreground">
                Wait for the current reply to finish before switching chats.
              </p>
            )}
          </div>

          <nav
            aria-label="Conversations"
            className="min-h-0 flex-1 overflow-y-auto p-2"
          >
            {conversations.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No conversations yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {conversations.map((c) => {
                  const active = c.id === activeId;
                  return (
                    <li key={c.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => onSelect(c.id)}
                        disabled={busy && !active}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex w-full flex-col items-start gap-0.5 rounded-md py-2 pr-10 pl-3 text-left text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                          active && "bg-muted",
                        )}
                      >
                        <span className="line-clamp-1 font-medium">
                          {c.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatUpdated(c.updatedAt)}
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete "${c.title}"`}
                        onClick={() => onDelete(c.id)}
                        disabled={busy && active}
                        // Always visible on touch-sized screens, which have no hover.
                        className="absolute top-1/2 right-1 -translate-y-1/2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
