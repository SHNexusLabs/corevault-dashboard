"use client";

import { useRouter } from "next/navigation";
import { Shipping } from "@/components/admin/FulfillmentQueues";
import { pageToHref } from "@/lib/navigation";
import type { Page } from "@/lib/types";

export default function ShippingPage() {
  const router = useRouter();

  const navigate = (page: Page, entityId?: string) => {
    router.push(pageToHref(page, entityId));
  };

  return <Shipping onNavigate={navigate} />;
}