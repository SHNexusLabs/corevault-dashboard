"use client";

import { useParams, useRouter } from "next/navigation";
import { ProductDetail } from "@/components/admin/CatalogPages";
import { pageToHref } from "@/lib/navigation";
import type { Page } from "@/lib/types";

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const navigate = (page: Page, entityId?: string) =>
    router.push(pageToHref(page, entityId));
  return <ProductDetail productId={params.id} onNavigate={navigate} />;
}
