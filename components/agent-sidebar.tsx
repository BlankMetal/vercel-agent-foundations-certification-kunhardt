"use client";

import dynamic from "next/dynamic";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

// The chat restores its history from localStorage, which the server can't
// read, so it renders on the client only.
const AgentChat = dynamic(
  () => import("@/components/agent-chat").then((m) => m.AgentChat),
  { ssr: false },
);

export function AgentSidebar() {
  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader>
        <div className="px-2 py-1.5 text-sm font-semibold">
          Ship It Shop Agent
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden p-0">
        <AgentChat />
      </SidebarContent>
    </Sidebar>
  );
}
