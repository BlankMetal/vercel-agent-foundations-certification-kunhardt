"use client";

import dynamic from "next/dynamic";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { AgentGlyph } from "@/components/agent-button";
import { TileField } from "@/components/art/tiles";

// The chat restores its history from localStorage, which the server can't
// read, so it renders on the client only.
const AgentChat = dynamic(
  () => import("@/components/agent-chat").then((m) => m.AgentChat),
  { ssr: false },
);

export function AgentSidebar() {
  return (
    <Sidebar side="right" collapsible="offcanvas" className="border-l-foreground!">
      <SidebarHeader className="gap-0 p-0">
        <div className="flex items-center gap-3 px-4 py-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background">
            <AgentGlyph active />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-[-0.01em]">Ship It Shop Agent</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Shopping assistant
            </p>
          </div>
        </div>
        <TileField
          cols={14}
          rows={1}
          seed="agent-panel"
          animate={0.4}
          paper="var(--sidebar)"
          className="aspect-[14/1] w-full border-y border-foreground"
        />
      </SidebarHeader>
      <SidebarContent className="overflow-hidden p-0">
        <AgentChat />
      </SidebarContent>
    </Sidebar>
  );
}
