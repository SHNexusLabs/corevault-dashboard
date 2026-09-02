"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { ToastProvider } from "@/components/ui/Toast";

import { pageToHref, pathToPage, type NavigateFn } from "@/lib/navigation";
import { getCurrentUser, logout } from "@/lib/auth";

import type { UserRole } from "@/lib/types";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const savedTheme = window.localStorage.getItem("corevault-admin-theme");

    return savedTheme === "light" ? "light" : "dark";
  });

  const [userName, setUserName] = useState("Loading...");
  const [role, setRole] = useState<UserRole | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const currentPage = pathToPage(pathname);

  useEffect(() => {
    window.localStorage.setItem("corevault-admin-theme", theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const user = await getCurrentUser();

        if (cancelled) return;

        if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
          logout();
          router.replace("/login");
          return;
        }

        setUserName(user.name);

        setRole(user.role === "SUPER_ADMIN" ? "super_admin" : "admin");
      } catch {
        if (!cancelled) {
          logout();
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const navigate = useCallback<NavigateFn>(
    (page, entityId) => {
      router.push(pageToHref(page, entityId));
    },
    [router],
  );

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (authLoading || !role) {
    return (
      <div className="h-dvh flex items-center justify-center bg-surface text-text">
        <div className="text-sm text-text-muted">Loading CoreVault...</div>
      </div>
    );
  }

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
            onThemeToggle={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header
              currentPage={currentPage}
              onNavigate={navigate}
              role={role}
              sidebarCollapsed={sidebarCollapsed}
              onSidebarToggle={() => setSidebarCollapsed((current) => !current)}
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
