"use client";

import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/admin/Dashboard";
import { pageToHref, type NavigateFn } from "@/lib/navigation";

export function DashboardClient() {
  const router = useRouter();
  const navigate: NavigateFn = (page, entityId) =>
    router.push(pageToHref(page, entityId));
  return <Dashboard onNavigate={navigate} />;
}
