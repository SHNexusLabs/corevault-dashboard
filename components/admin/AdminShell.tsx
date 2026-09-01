"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { ToastProvider } from "@/components/ui/Toast";
import { pageToHref, pathToPage, type NavigateFn } from "@/lib/navigation";
import type { UserRole } from "@/lib/types";

type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "corevault-admin-theme";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  // Temporary mock session.
  // Replace with auth API/session after UI migration.
  const role: UserRole = "super_admin";
  const userName = "CoreVault Admin";
  const currentPage = pathToPage(pathname);

  /*
   * Load the saved theme without triggering setState()
   * directly inside an effect.
   */
  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === "light") {
      document.documentElement.classList.add("theme-light");
      document.documentElement.dataset.theme = "light";
    } else {
      document.documentElement.classList.remove("theme-light");
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

  /*
   * Keep localStorage and the document theme synchronized
   * whenever React's theme state changes.
   */
  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (theme === "light") {
      document.documentElement.classList.add("theme-light");
      document.documentElement.dataset.theme = "light";
    } else {
      document.documentElement.classList.remove("theme-light");
      document.documentElement.dataset.theme = "dark";
    }
  }, [theme]);

  const navigate = useCallback<NavigateFn>(
    (page, entityId) => {
      router.push(pageToHref(page, entityId));
    },
    [router],
  );

  const handleLogout = () => {
    // TODO: call backend logout / clear auth cookie.
    router.push("/login");
  };

  const handleThemeToggle = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className={theme === "light" ? "theme-light" : ""}>
      <ToastProvider>
        <div className="h-dvh flex overflow-hidden bg-surface text-text theme-transition">
          <Sidebar
            currentPage={currentPage}
            onNavigate={navigate}
            role={role}
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
            theme={theme}
            onThemeToggle={handleThemeToggle}
          />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header
              currentPage={currentPage}
              onNavigate={navigate}
              role={role}
              sidebarCollapsed={sidebarCollapsed}
              onSidebarToggle={() =>
                setSidebarCollapsed((collapsed) => !collapsed)
              }
              userName={userName}
              onLogout={handleLogout}
            />

            <main className="flex-1 overflow-hidden flex flex-col min-h-0">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </div>
  );
}
