import type { Metadata } from "next";
import { AdminWorkspace } from "@/components/admin-workspace";

export const metadata: Metadata = {
  title: "Store Admin Agent",
};

export default function AdminPage() {
  return <AdminWorkspace />;
}
