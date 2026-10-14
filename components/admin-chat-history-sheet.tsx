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
import { TileField } from "@/components/art/tiles";

// The pull tab on the drawer's edge. The closed rail and the open drawer use
// the same shape so it reads as one handle that moves with the drawer.
const TAB =
  "flex h-16 w-7 items-center justify-center rounded-r-full bg-foreground pr-1 text-background transition-[width] [&_svg]:size-4";

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
          className="group fixed inset-y-0 left-0 z-40 w-1.5 bg-foreground transition-[width] hover:w-2.5 focus-visible:w-2.5 focus-visible:outline-none motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            className={cn(
              TAB,
              "absolute top-1/2 left-full -translate-y-1/2 group-hover:w-8 group-focus-visible:ring-2 group-focus-visible:ring-ring",
            )}
          >
            <ChevronRight />
          </span>
        </button>
      )}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="gap-0 border-r-foreground p-0">
          <button
            type="button"
            aria-label="Close chat history"
            onClick={() => onOpenChange(false)}
            className={cn(
              TAB,
              "absolute top-1/2 left-full -translate-y-1/2 hover:w-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            <ChevronLeft />
          </button>
          <SheetHeader className="gap-2 px-5 pt-6 pb-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Archive
            </p>
            <SheetTitle className="text-3xl font-semibold tracking-[-0.04em]">Chat history</SheetTitle>
            <SheetDescription>Saved in this browser only.</SheetDescription>
          </SheetHeader>
          <TileField
            cols={10}
            rows={1}
            seed={`history-${conversations.length}`}
            animate={0.4}
            className="aspect-[10/1] w-full border-y border-foreground"
          />

          <div className="border-b p-3">
            <Button
              className="h-10 w-full rounded-full"
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
                          "relative flex w-full flex-col items-start gap-0.5 rounded-lg py-2.5 pr-10 pl-4 text-left text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                          active &&
                            "bg-muted before:absolute before:top-1/2 before:left-1 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-foreground",
                        )}
                      >
                        <span className="line-clamp-1 font-medium">
                          {c.title}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
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
