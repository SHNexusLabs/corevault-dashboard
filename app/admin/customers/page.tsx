"use client";

import { useRouter } from "next/navigation";
import { Customers } from "@/components/admin/Customers";
import type { NavigateFn } from "@/lib/navigation";
import { pageToHref } from "@/lib/navigation";

export default function Page() {
  const router = useRouter();
  const navigate: NavigateFn = (page, entityId) =>
    router.push(pageToHref(page, entityId));
  return <Customers onNavigate={navigate} />;
}
