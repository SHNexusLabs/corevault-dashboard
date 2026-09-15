"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Info,
  Plus,
  Shield,
  RotateCcw,
  Save,
  Loader2,
} from "lucide-react";

import {
  getAdminRolePermissions,
  updateAdminRolePermissions,
  type AdminRole,
  type AdminRolePermission,
} from "@/lib/admin-roles";

type RoleOption = {
  value: AdminRole;
  label: string;
  description: string;
  iconClass: string;
};

const ROLES: RoleOption[] = [
  {
    value: "ADMIN",
    label: "Admin",
    description: "Operational staff",
    iconClass: "text-blue-400",
  },
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    description: "System owner",
    iconClass: "text-brand",
  },
];

export function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState<AdminRole>("ADMIN");

  const [permissions, setPermissions] = useState<AdminRolePermission[]>([]);

  const [originalPermissions, setOriginalPermissions] = useState<Set<string>>(
    new Set(),
  );

  const [isEditable, setIsEditable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [changed, setChanged] = useState(false);

  /*
   * Load permissions for the selected role.
   */

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAdminRolePermissions(selectedRole);

        if (cancelled) return;

        setPermissions(response.permissions);
        setIsEditable(response.isEditable);

        const enabledPermissions = new Set(
          response.permissions
            .filter((permission) => permission.enabled)
            .map((permission) => permission.id),
        );

        setOriginalPermissions(enabledPermissions);
        setChanged(false);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Failed to load permissions",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [selectedRole]);

  /*
   * Group permissions by the section provided by the backend.
   */
  const permissionSections = useMemo(() => {
    const sectionOrder = [
      "Operations",
      "Catalog",
      "Customers & Finance",
      "Administration",
      "System Settings",
    ];

    const sections = new Map<string, AdminRolePermission[]>();

    for (const permission of permissions) {
      const existing = sections.get(permission.section);

      if (existing) {
        existing.push(permission);
      } else {
        sections.set(permission.section, [permission]);
      }
    }

    return sectionOrder
      .filter((section) => sections.has(section))
      .map((section) => ({
        section,
        permissions: sections.get(section) ?? [],
      }));
  }, [permissions]);

  /*
   * Toggle an ADMIN permission.
   *
   * SUPER_ADMIN permissions are immutable.
   */
  const togglePermission = (permissionId: string) => {
    if (!isEditable || selectedRole !== "ADMIN") {
      return;
    }

    setPermissions((current) =>
      current.map((permission) =>
        permission.id === permissionId
          ? {
              ...permission,
              enabled: !permission.enabled,
            }
          : permission,
      ),
    );

    setChanged(true);
  };

  /*
   * Save ADMIN permissions to the backend.
   */
  const handleSave = async () => {
    if (!isEditable || selectedRole !== "ADMIN") {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const permissionIds = permissions
        .filter((permission) => permission.enabled)
        .map((permission) => permission.id);

      const response = await updateAdminRolePermissions(permissionIds);

      setPermissions(response.permissions);
      setIsEditable(response.isEditable);

      const enabledPermissions = new Set(
        response.permissions
          .filter((permission) => permission.enabled)
          .map((permission) => permission.id),
      );

      setOriginalPermissions(enabledPermissions);
      setChanged(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save permissions",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Restore the last saved database state.
   */
  const handleReset = () => {
    if (!isEditable || selectedRole !== "ADMIN") {
      return;
    }

    setPermissions((current) =>
      current.map((permission) => ({
        ...permission,
        enabled: originalPermissions.has(permission.id),
      })),
    );

    setChanged(false);
  };

  /*
   * Switch role.
   *
   * Permissions are reloaded automatically through
   * the selectedRole dependency of loadPermissions().
   */
  const handleRoleChange = (role: AdminRole) => {
    if (role === selectedRole) {
      return;
    }

    setChanged(false);
    setError(null);
    setSelectedRole(role);
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="space-y-6 pb-8 m-4">
        {/* =========================================================
            Header
        ========================================================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Roles & Permissions
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage access permissions for administrative roles.
            </p>
          </div>

          {selectedRole === "ADMIN" && changed && isEditable && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-brand px-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* =========================================================
            Error
        ========================================================== */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =========================================================
            Role selector
        ========================================================== */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROLES.map((role) => {
            const selected = selectedRole === role.value;

            return (
              <button
                key={role.value}
                type="button"
                onClick={() => handleRoleChange(role.value)}
                className={[
                  "flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
                  selected
                    ? "border-brand bg-brand/5"
                    : "border-border hover:bg-muted/50",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted",
                    role.iconClass,
                  ].join(" ")}
                >
                  <Shield className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="font-medium">{role.label}</div>

                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {role.description}
                  </div>
                </div>

                {selected && (
                  <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* =========================================================
            Super Admin information
        ========================================================== */}
        {selectedRole === "SUPER_ADMIN" && (
          <div className="flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Info className="h-5 w-5" />
            </div>

            <div>
              <p className="font-medium">Super Admin has all permissions</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Super Admin permissions cannot be modified. System owners
                automatically have access to all administrative capabilities.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================
            Permission matrix
        ========================================================== */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Loading */}
          {loading ? (
            <div className="flex min-h-90 items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading permissions...
              </div>
            </div>
          ) : permissions.length === 0 ? (
            <div className="flex min-h-90 items-center justify-center text-sm text-muted-foreground">
              No permissions found.
            </div>
          ) : (
            <div>
              {permissionSections.map(
                ({ section, permissions: sectionPermissions }) => (
                  <div
                    key={section}
                    className="border-b border-border last:border-b-0"
                  >
                    {/* Section header */}
                    <div className="border-b border-border bg-muted/30 px-5 py-3">
                      <h2 className="text-sm font-semibold text-text">
                        {section}
                      </h2>
                    </div>

                    {/* Permission rows */}
                    <div className="divide-y divide-border">
                      {sectionPermissions.map((permission) => {
                        const disabled =
                          selectedRole === "SUPER_ADMIN" ||
                          !isEditable ||
                          permission.isSuperAdminOnly ||
                          saving;

                        return (
                          <div
                            key={permission.id}
                            className="flex min-h-18 items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-text">
                                  {permission.name}
                                </p>

                                {permission.isSuperAdminOnly && (
                                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand">
                                    Super Admin
                                  </span>
                                )}
                              </div>

                              {permission.description && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              )}
                            </div>

                            {/* Permission toggle */}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={permission.enabled}
                              aria-label={`Toggle ${permission.name}`}
                              disabled={disabled}
                              onClick={() => togglePermission(permission.id)}
                              className={[
                                "relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                                permission.enabled ? "bg-brand" : "bg-muted",
                                disabled
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                                  permission.enabled
                                    ? "translate-x-5"
                                    : "translate-x-0.5",
                                ].join(" ")}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* =========================================================
            Future custom roles
        ========================================================== */}
        <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Shield className="h-4 w-4" />
            </div>

            <div>
              <p className="font-medium">Custom roles</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Custom role support can be added later when your team needs more
                granular access profiles.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Custom Role
          </button>
        </div>
      </div>
    </div>
  );
}
