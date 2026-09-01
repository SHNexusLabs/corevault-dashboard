"use client";

import { useRouter } from "next/navigation";
import { Products } from "@/components/admin/Products";
import { pageToHref } from "@/lib/navigation";
import type { Page } from "@/lib/types";

export default function Page() {
  const router = useRouter();
  const navigate = (page: Page, entityId?: string) =>
    router.push(pageToHref(page, entityId));
  return <Products onNavigate={navigate} />;
}
