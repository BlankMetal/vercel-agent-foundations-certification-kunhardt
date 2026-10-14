"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { UIMessage } from "ai";
import { Bot } from "lucide-react";
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
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="h-5 w-5" aria-hidden="true" />
            <span>Store Admin Agent</span>
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      {/* Extra left padding below 840px keeps the history tab off the chat card. */}
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col py-4 pr-4 pl-10 min-[840px]:pl-4">
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-card">
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
