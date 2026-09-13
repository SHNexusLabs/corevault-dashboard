"use client";

import { useRouter } from "next/navigation";
import { Invoices } from "@/components/admin/PaymentsInvoices";
import type { NavigateFn } from "@/lib/navigation";
import { pageToHref } from "@/lib/navigation";

export default function Page() {
  const router = useRouter();

  const navigate: NavigateFn = (page, entityId) => {
    router.push(pageToHref(page, entityId));
  };

  return <Invoices onNavigate={navigate} />;
}
