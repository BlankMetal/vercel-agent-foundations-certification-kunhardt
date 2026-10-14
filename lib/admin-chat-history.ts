import type { UIMessage } from "ai";

/**
 * Admin chat history, kept in this browser's localStorage. Nothing is stored
 * server-side, so history doesn't follow a staff member to another device.
 */
export interface AdminConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
}

const CONVERSATIONS_KEY = "admin-chat-history";
const ACTIVE_KEY = "admin-chat-active";

// localStorage holds about 5 MB per origin, and tool outputs are stored with
// each message (a sales pull is ~7 KB), so cap the list.
const MAX_CONVERSATIONS = 30;

// localStorage can be unavailable or throw (private windows, blocked site
// data). History then lasts only until the page is reloaded.
export function loadConversations(): AdminConversation[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isQuotaError(err: unknown) {
  return (
    err instanceof DOMException &&
    // Firefox uses its own name for the same error.
    (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

/** Saves newest first and returns what was kept, dropping the oldest until it fits. */
export function saveConversations(list: AdminConversation[]): AdminConversation[] {
  let kept = [...list]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CONVERSATIONS);
  for (;;) {
    try {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(kept));
      return kept;
    } catch (err) {
      // Storage that's blocked rather than full: keep everything in memory.
      if (!isQuotaError(err) || kept.length <= 1) return kept;
      kept = kept.slice(0, -1);
    }
  }
}

export function loadActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function saveActiveId(id: string) {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {}
}

const TITLE_LENGTH = 60;

/** The first thing the user asked, cut to fit one line in the sidebar. */
export function titleFor(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const text = firstUser?.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "New conversation";
  return text.length > TITLE_LENGTH ? `${text.slice(0, TITLE_LENGTH - 1)}…` : text;
}
