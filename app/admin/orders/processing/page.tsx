"use client";

import { useRouter } from "next/navigation";
import { Processing } from "@/components/admin/FulfillmentQueues";
import { pageToHref } from "@/lib/navigation";
import type { Page } from "@/lib/types";

export default function ProcessingPage() {
  const router = useRouter();

  const navigate = (page: Page, entityId?: string) => {
    router.push(pageToHref(page, entityId));
  };

  return <Processing onNavigate={navigate} />;
}