"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Shield,
  Lock,
  CalendarDays,
  CheckCircle2,
  Pencil,
  KeyRound,
  X,
  RefreshCw,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  changeAdminPassword,
  getAdminProfile,
  updateAdminProfile,
  type AdminProfile,
} from "@/lib/admin-profile";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatRole(role: AdminProfile["role"]) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    default:
      return role;
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const closePasswordModal = () => {
    setChangingPassword(false);
    setPasswordError(null);
    setPasswordSuccess(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  async function loadProfile() {
    try {
      setLoading(true);
      setError(null);

      const data = await getAdminProfile();

      setProfile(data);
      setDraftName(data.name);
      setDraftEmail(data.email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve your profile",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initialLoad() {
      await loadProfile();
    }

    void initialLoad();
  }, []);

  const startEditing = () => {
    if (!profile) return;

    setDraftName(profile.name);
    setDraftEmail(profile.email);
    setEditing(true);
  };

  const cancelEditing = () => {
    if (!profile) return;

    setDraftName(profile.name);
    setDraftEmail(profile.email);
    setEditing(false);
  };

  const saveProfile = async () => {
    if (!profile) return;

    const nextName = draftName.trim();
    const nextEmail = draftEmail.trim();

    if (!nextName) {
      setSaveError("Name is required");
      return;
    }

    if (!nextEmail) {
      setSaveError("Email is required");
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      const updatedProfile = await updateAdminProfile({
        name: nextName,
        email: nextEmail,
        phone: profile.phone,
      });

      setProfile(updatedProfile);
      setDraftName(updatedProfile.name);
      setDraftEmail(updatedProfile.email);
      setEditing(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Unable to update your profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Enter your current password");
      return;
    }

    if (!newPassword) {
      setPasswordError("Enter a new password");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      setPasswordSaving(true);

      const message = await changeAdminPassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setChangingPassword(false);
        setPasswordSuccess(null);
      }, 1200);
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Unable to change password",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 p-4">
        <div>
          <h1 className="text-lg font-semibold text-text">My Profile</h1>
          <p className="mt-1 text-xs text-text-muted">
            Manage your account information and security preferences.
          </p>
        </div>

        <Card className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading profile...
          </div>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-5 p-4">
        <div>
          <h1 className="text-lg font-semibold text-text">My Profile</h1>
          <p className="mt-1 text-xs text-text-muted">
            Manage your account information and security preferences.
          </p>
        </div>

        <Card className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger">
            <User className="h-5 w-5" />
          </div>

          <p className="text-sm font-medium text-text">
            Unable to load profile
          </p>

          <p className="mt-1 max-w-sm text-xs text-text-muted">
            {error ?? "Admin profile could not be found."}
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void loadProfile()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = formatRole(profile.role);

  return (
    <div className="space-y-5 p-4">
      {/* Page heading */}
      <div>
        <h1 className="text-lg font-semibold text-text">My Profile</h1>

        <p className="mt-1 text-xs text-text-muted">
          Manage your account information and security preferences.
        </p>
      </div>

      {/* Profile overview */}
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-surface-elevated/40 px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-surface">
                {initials}
              </div>

              <div>
                <h2 className="text-base font-semibold text-text">
                  {profile.name}
                </h2>

                <p className="mt-0.5 text-xs text-text-muted">
                  {profile.email}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2 py-1 text-[10px] font-semibold text-brand">
                    <Shield className="h-3 w-3" />
                    {roleLabel}
                  </span>

                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold",
                      profile.isActive
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger",
                    )}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {profile.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startEditing}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Personal information */}
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">
                Personal Information
              </h2>

              <p className="mt-1 text-[11px] text-text-muted">
                Your basic account details.
              </p>
            </div>

            <User className="h-4 w-4 text-text-muted" />
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-text-muted">
                  Full Name
                </label>

                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs text-text outline-none transition-colors focus:border-brand/50 focus:ring-1 focus:ring-brand/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-text-muted">
                  Email Address
                </label>

                <input
                  type="email"
                  value={draftEmail}
                  onChange={(event) => setDraftEmail(event.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs text-text outline-none transition-colors focus:border-brand/50 focus:ring-1 focus:ring-brand/30"
                />
                {saveError && (
                  <p className="text-[11px] text-danger">{saveError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditing}
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={saving}
                  onClick={() => void saveProfile()}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow
                icon={<User className="h-3.5 w-3.5" />}
                label="Full Name"
                value={profile.name}
              />

              <InfoRow
                icon={<Mail className="h-3.5 w-3.5" />}
                label="Email Address"
                value={profile.email}
              />

              <InfoRow
                icon={<Mail className="h-3.5 w-3.5" />}
                label="Phone"
                value={profile.phone ?? "Not provided"}
              />
            </div>
          )}
        </Card>

        {/* Account information */}
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">
                Account Information
              </h2>

              <p className="mt-1 text-[11px] text-text-muted">
                Your CoreVault administrator access.
              </p>
            </div>

            <Shield className="h-4 w-4 text-text-muted" />
          </div>

          <div className="space-y-4">
            <InfoRow
              icon={<Shield className="h-3.5 w-3.5" />}
              label="Role"
              value={roleLabel}
            />

            <InfoRow
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              label="Account Status"
              value={profile.isActive ? "Active" : "Inactive"}
              valueClassName={profile.isActive ? "text-success" : "text-danger"}
            />

            <InfoRow
              icon={<CalendarDays className="h-3.5 w-3.5" />}
              label="Account Created"
              value={formatDate(profile.createdAt)}
            />
          </div>
        </Card>

        {/* Security */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">Security</h2>

              <p className="mt-1 text-[11px] text-text-muted">
                Manage your account password and security.
              </p>
            </div>

            <Lock className="h-4 w-4 text-text-muted" />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-elevated/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <KeyRound className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-medium text-text">Password</p>

                <p className="mt-0.5 text-[11px] text-text-muted">
                  Your account password is securely stored.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPasswordError(null);
                setPasswordSuccess(null);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setChangingPassword(true);
              }}
            >
              Change Password
            </Button>
          </div>
        </Card>
      </div>

      {/* Change password modal */}
      {changingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text">
                  Change Password
                </h2>

                <p className="mt-1 text-[11px] text-text-muted">
                  Update your administrator password.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-elevated hover:text-text"
                onClick={() => setChangingPassword(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <PasswordInput
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />

              <PasswordInput
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
              />

              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />

              {passwordError && (
                <div className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-[11px] text-danger">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-[11px] text-success">
                  {passwordSuccess}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closePasswordModal}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={passwordSaving}
                onClick={() => void handleChangePassword()}
              >
                {passwordSaving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2.5">
        <span className="text-text-muted">{icon}</span>

        <span className="text-[11px] text-text-muted">{label}</span>
      </div>

      <span
        className={cn(
          "max-w-[60%] truncate text-right text-xs font-medium text-text",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-text-muted">
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="current-password"
        className="h-9 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs text-text outline-none transition-colors focus:border-brand/50 focus:ring-1 focus:ring-brand/30"
      />
    </div>
  );
}
