"use client";
import { useRouter } from "next/navigation";
import type { Page } from "@/lib/types";
import { pageToHref } from "@/lib/navigation";
export function AdminPageNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const navigate = (page: Page, entityId?: string) =>
    router.push(pageToHref(page, entityId));
  return (
    <NavigationContext.Provider value={navigate}>
      {children}
    </NavigationContext.Provider>
  );
}
import { createContext, useContext } from "react";
const NavigationContext = createContext<
  (page: Page, entityId?: string) => void
>(() => {});
export function useAdminNavigate() {
  return useContext(NavigationContext);
}
