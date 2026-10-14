"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { UIMessage } from "ai";
import { logoutAction } from "@/lib/admin-actions";
import {
  type AdminConversation,
  loadActiveId,
  loadConversations,
  saveActiveId,
  saveConversations,
  titleFor,
} from "@/lib/admin-chat-history";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AdminAgentChat } from "./admin-agent-chat";
import { AdminChatHistorySheet } from "./admin-chat-history-sheet";
import { IsometricField } from "./art/isometric-field";
import { ShopMark } from "./art/shop-mark";
import { ThemeToggle } from "./theme-toggle";

export function AdminWorkspace() {
  // null until localStorage has been read after mount; the server can't see it.
  const [conversations, setConversations] = useState<AdminConversation[] | null>(null);
  const [activeId, setActiveId] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const saved = loadConversations();
    const lastActive = loadActiveId();
    setConversations(saved);
    // Reopen the conversation that was open before the reload, if it still exists.
    setActiveId(saved.some((c) => c.id === lastActive) ? lastActive! : crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (activeId) saveActiveId(activeId);
  }, [activeId]);

  const persist = useCallback((id: string, messages: UIMessage[]) => {
    // A new chat isn't listed until its first message.
    if (messages.length === 0) return;
    setConversations((prev) => {
      const list = prev ?? [];
      const existing = list.find((c) => c.id === id);
      // Opening a conversation re-reports its saved messages; don't bump it to the top.
      if (existing && JSON.stringify(existing.messages) === JSON.stringify(messages)) {
        return prev;
      }
      const now = Date.now();
      const next = existing
        ? list.map((c) => (c.id === id ? { ...c, messages, updatedAt: now } : c))
        : [{ id, title: titleFor(messages), createdAt: now, updatedAt: now, messages }, ...list];
      return saveConversations(next);
    });
  }, []);

  const startNewChat = () => {
    setActiveId(crypto.randomUUID());
    setHistoryOpen(false);
  };

  const selectConversation = (id: string) => {
    setActiveId(id);
    setHistoryOpen(false);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => saveConversations((prev ?? []).filter((c) => c.id !== id)));
    if (id === activeId) setActiveId(crypto.randomUUID());
  };

  return (
    <div className="relative isolate flex h-screen flex-col">
      {/* The cube field, faded out towards the centre so the chat stays calm. */}
      <IsometricField
        id="admin-cubes"
        scale={1.2}
        className="-z-10 opacity-[0.09] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_85%)]"
      />
      <header className="sticky top-0 z-50 w-full border-b border-foreground bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <Link href="/admin" className="group flex items-center gap-2.5">
            <ShopMark />
            <span className="text-[15px] font-semibold tracking-[-0.02em]">Store Admin Agent</span>
            <span className="hidden rounded-full border border-foreground px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] sm:inline">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="rounded-full font-mono text-[11px] uppercase tracking-[0.16em]">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Extra left padding below 840px keeps the history tab off the chat card. */}
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col py-6 pr-5 pl-12 min-[840px]:pl-4">
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-foreground bg-card shadow-[6px_6px_0_0_var(--foreground)]">
          {conversations === null || !activeId ? (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <AdminAgentChat
              // A new key gives each conversation its own useChat state.
              key={activeId}
              conversationId={activeId}
              initialMessages={conversations.find((c) => c.id === activeId)?.messages ?? []}
              onMessagesChange={persist}
              onBusyChange={setBusy}
              onNewChat={startNewChat}
            />
          )}
        </div>
      </div>

      {conversations !== null && (
        <AdminChatHistorySheet
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          conversations={conversations}
          activeId={activeId}
          busy={busy}
          onSelect={selectConversation}
          onNew={startNewChat}
          onDelete={deleteConversation}
        />
      )}
    </div>
  );
}
