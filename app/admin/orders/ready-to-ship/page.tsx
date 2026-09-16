"use client";

import { useRouter } from "next/navigation";
import { ReadyToShip } from "@/components/admin/FulfillmentQueues";
import { pageToHref } from "@/lib/navigation";
import type { Page } from "@/lib/types";

export default function ReadyToShipPage() {
  const router = useRouter();

  const navigate = (page: Page, entityId?: string) => {
    router.push(pageToHref(page, entityId));
  };

  return <ReadyToShip onNavigate={navigate} />;
}