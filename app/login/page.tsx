"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  ShieldOff,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { login } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AuthState =
  | "login"
  | "forgot-password"
  | "reset-sent"
  | "session-expired"
  | "account-disabled";

function CoreVaultLogo({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28 4L50 16.5V39.5L28 52L6 39.5V16.5L28 4Z"
        fill="var(--color-brand)"
        fillOpacity="0.12"
        stroke="var(--color-brand)"
        strokeWidth="1.5"
      />
      <rect
        x="19"
        y="19"
        width="18"
        height="18"
        rx="3.5"
        stroke="var(--color-brand)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M25 28h6M28 25v6"
        stroke="var(--color-brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const inputCls = [
  "w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-elevated",
  "text-sm text-text placeholder:text-text-muted",
  "focus:outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/50",
  "transition-colors duration-150",
].join(" ");

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-xl">
      {children}
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-9 rounded-lg text-sm font-semibold bg-brand text-surface hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
      ) : (
        label
      )}
    </button>
  );
}

type StatusType = "success" | "warning" | "danger" | "info";

function StatusHeader({
  icon,
  iconBg,
  title,
  message,
  type,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  message: string;
  type: StatusType;
}) {
  const textColors: Record<StatusType, string> = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
  };

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          iconBg,
        )}
      >
        {icon}
      </div>

      <div>
        <h2 className={cn("text-sm font-semibold", textColors[type])}>
          {title}
        </h2>

        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [authState, setAuthState] = useState<AuthState>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadSavedTheme = () => {
      try {
        const savedTheme = window.localStorage.getItem("corevault-admin-theme");

        if (savedTheme === "light" || savedTheme === "dark") {
          setTheme(savedTheme);
        }

        setMounted(true);
      } catch {
        setMounted(true);
      }
    };

    const frame = window.requestAnimationFrame(loadSavedTheme);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const handleThemeToggle = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";

      try {
        window.localStorage.setItem("corevault-admin-theme", next);
      } catch {
        // Ignore localStorage access errors.
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        setError("You do not have permission to access the admin dashboard.");
        return;
      }

      router.replace("/admin");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.";

      if (message === "Your account has been disabled") {
        setAuthState("account-disabled");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    // Password reset API does not exist in the current backend.
    // Keep the Figma flow for now until that endpoint is implemented.
    setTimeout(() => {
      setLoading(false);
      setAuthState("reset-sent");
    }, 1000);
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-surface flex items-center justify-center p-4 relative",
        mounted && theme === "light" && "theme-light",
      )}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-brand) 1px, transparent 1px), linear-gradient(to right, var(--color-brand) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Logo glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-brand opacity-[0.04] blur-3xl pointer-events-none" />

      {/* Theme toggle */}
      <button
        type="button"
        className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-border bg-surface-card flex items-center justify-center text-text-muted hover:text-text transition-colors"
        onClick={handleThemeToggle}
        aria-label="Toggle theme"
      >
        {mounted && theme === "light" ? (
          <Sun className="w-3.5 h-3.5" />
        ) : (
          <Moon className="w-3.5 h-3.5" />
        )}
      </button>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-3">
            <CoreVaultLogo size={52} />
          </div>

          <h1 className="text-lg font-bold text-text tracking-widest">
            CORE VAULT
          </h1>

          <p className="text-[11px] text-text-muted mt-0.5 tracking-wide uppercase">
            Admin Operations Center
          </p>
        </div>

        {/* Session expired */}
        {authState === "session-expired" && (
          <AuthCard>
            <StatusHeader
              icon={<Clock className="w-5 h-5 text-warning" />}
              iconBg="bg-warning-muted border border-warning/20"
              title="Session Expired"
              message="Your session has expired for security reasons. Please sign in again to continue."
              type="warning"
            />

            <button
              type="button"
              className="mt-4 w-full h-9 bg-brand text-surface text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              onClick={() => setAuthState("login")}
            >
              Sign In Again
            </button>
          </AuthCard>
        )}

        {/* Account disabled */}
        {authState === "account-disabled" && (
          <AuthCard>
            <StatusHeader
              icon={<ShieldOff className="w-5 h-5 text-danger" />}
              iconBg="bg-danger-muted border border-danger/20"
              title="Account Disabled"
              message="Your account has been disabled by a Super Admin. Contact your system administrator for assistance."
              type="danger"
            />

            <button
              type="button"
              className="mt-4 w-full h-9 border border-border text-text-secondary text-sm rounded-lg hover:bg-surface-elevated transition-colors"
              onClick={() => {
                setAuthState("login");
                setError("");
              }}
            >
              ← Back to Sign In
            </button>
          </AuthCard>
        )}

        {/* Reset sent */}
        {authState === "reset-sent" && (
          <AuthCard>
            <StatusHeader
              icon={<Mail className="w-5 h-5 text-success" />}
              iconBg="bg-success-muted border border-success/20"
              title="Reset Link Sent"
              message={`We've sent a password reset link to ${
                forgotEmail || "your email"
              }. Check your inbox and follow the instructions.`}
              type="success"
            />

            <p className="mt-3 text-[11px] text-text-muted text-center">
              Didn&apos;t receive it?{" "}
              <button
                type="button"
                className="text-brand hover:underline"
                onClick={() => setAuthState("forgot-password")}
              >
                Try again
              </button>
            </p>

            <button
              type="button"
              className="mt-3 w-full h-9 border border-border text-text-secondary text-sm rounded-lg hover:bg-surface-elevated transition-colors"
              onClick={() => setAuthState("login")}
            >
              ← Back to Sign In
            </button>
          </AuthCard>
        )}

        {/* Forgot password */}
        {authState === "forgot-password" && (
          <AuthCard>
            <div className="mb-4">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors mb-4"
                onClick={() => setAuthState("login")}
              >
                <ArrowLeft className="w-3 h-3" />
                Back to sign in
              </button>

              <h2 className="text-sm font-semibold text-text">
                Reset your password
              </h2>

              <p className="text-xs text-text-muted mt-0.5">
                Enter your work email and we&apos;ll send a reset link.
              </p>
            </div>

            <form onSubmit={handleForgot} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Work Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />

                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@corevault.in"
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <SubmitBtn loading={loading} label="Send Reset Link" />
            </form>
          </AuthCard>
        )}

        {/* Login */}
        {authState === "login" && (
          <AuthCard>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-text">
                Sign in to your account
              </h2>

              <p className="text-xs text-text-muted mt-0.5">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="name@corevault.in"
                    className={inputCls}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-text-secondary">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[11px] text-brand hover:text-brand/80 transition-colors"
                    onClick={() => {
                      setAuthState("forgot-password");
                      setForgotEmail(email);
                      setError("");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />

                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••"
                    className={cn(inputCls, "pr-9")}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    onClick={() => setShowPass((current) => !current)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger-muted border border-danger/20">
                  <AlertCircle className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />

                  <p className="text-xs text-danger leading-relaxed">{error}</p>
                </div>
              )}

              <SubmitBtn loading={loading} label="Sign In" />
            </form>
          </AuthCard>
        )}

        <p className="text-center text-[11px] text-text-muted mt-4">
          Core Vault Admin v1.0 · Authorized personnel only
        </p>
      </div>
    </div>
  );
}
