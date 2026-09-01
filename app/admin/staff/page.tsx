"use client";
import { useRouter } from "next/navigation";
import { Staff } from "@/components/admin/Staff";
import { pageToHref, type NavigateFn } from "@/lib/navigation";

export default function Page() {
  const router = useRouter();
  const navigate: NavigateFn = (page, entityId) =>
    router.push(pageToHref(page, entityId));
  return <Staff onNavigate={navigate} />;
}
