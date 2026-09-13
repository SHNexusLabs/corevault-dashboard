"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UserCog,
  Plus,
  Edit,
  Ban,
  RefreshCw,
  LogOut,
  Eye,
  Activity,
} from "lucide-react";
import { Card, KPICard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { RoleBadge, StatusDot } from "@/components/ui/Badge";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import {
  createAdminStaff,
  getAdminStaff,
  updateAdminStaff,
  updateAdminStaffStatus,
  type AdminStaff,
  type AdminStaffRole,
} from "@/lib/admin-staff";
import type { Page } from "@/lib/types";

interface StaffProps {
  onNavigate: (page: Page) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function toUiRole(role: AdminStaffRole) {
  return role === "SUPER_ADMIN" ? "super_admin" : "admin";
}

function safeDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return formatDate(date).split(",")[0];
}

export function Staff({ onNavigate }: StaffProps) {
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState<string | null>(null);

  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    superAdmins: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "ADMIN" as AdminStaffRole,
  });

  const [editingStaff, setEditingStaff] = useState<AdminStaff | null>(null);

  const loadStaff = useCallback(async () => {
    try {
      setError(null);

      const response = await getAdminStaff(1, 100, {
        search,
      });

      setStaff(response.staff);
      setStats(response.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStaff();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loadStaff]);

  function openCreateModal() {
    setEditingStaff(null);
    setForm({
      name: "",
      email: "",
      role: "ADMIN",
    });
    setCreateModal(true);
  }

  function openEditModal(member: AdminStaff) {
    setEditingStaff(member);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
    });
    setCreateModal(true);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingStaff) {
        await updateAdminStaff(editingStaff.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        });
      } else {
        const response = await createAdminStaff({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        });

        /*
         * The backend currently generates a temporary password.
         * We do not display it here because the intended flow is
         * to add a proper invitation/reset-password mechanism later.
         */
        void response.temporaryPassword;
      }

      setCreateModal(false);
      setEditingStaff(null);

      await loadStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save staff");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: string, isActive: boolean) {
    try {
      setSaving(true);
      setError(null);

      await updateAdminStaffStatus(id, isActive);

      setConfirmDisable(null);

      await loadStaff();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update staff status",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label="Total Staff"
          value={stats.total}
          icon={<UserCog className="w-5 h-5 text-brand" />}
          iconBg="bg-brand-muted border border-brand/20"
        />

        <KPICard
          label="Active"
          value={stats.active}
          icon={<UserCog className="w-5 h-5 text-success" />}
          iconBg="bg-success-muted border border-success/20"
        />

        <KPICard
          label="Admins"
          value={stats.admins}
          icon={<UserCog className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/10 border border-blue-500/20"
        />

        <KPICard
          label="Super Admins"
          value={stats.superAdmins}
          icon={<UserCog className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/10 border border-purple-500/20"
        />
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-text">Staff Members</h2>

          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              className="w-48"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={openCreateModal}
            >
              Add Staff
            </Button>
          </div>
        </div>

        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th sortable>Last Active</Th>
              <Th>Created</Th>
              <Th className="w-32" />
            </tr>
          </Thead>

          <Tbody>
            {loading ? (
              <Tr>
                <Td>
                  <div className="py-8 text-center text-xs text-text-muted">
                    Loading staff...
                  </div>
                </Td>
              </Tr>
            ) : staff.length === 0 ? (
              <Tr>
                <Td>
                  <div className="py-8 text-center text-xs text-text-muted">
                    No staff members found.
                  </div>
                </Td>
              </Tr>
            ) : (
              staff.map((member) => (
                <Tr key={member.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-muted border border-brand/20 flex items-center justify-center text-xs font-bold text-brand shrink-0">
                        {getInitials(member.name)}
                      </div>

                      <span className="text-xs font-medium text-text">
                        {member.name}
                      </span>
                    </div>
                  </Td>

                  <Td>
                    <span className="text-xs text-text-secondary">
                      {member.email}
                    </span>
                  </Td>

                  <Td>
                    <RoleBadge role={toUiRole(member.role)} />
                  </Td>

                  <Td>
                    <StatusDot active={member.isActive} />
                  </Td>

                  <Td>
                    <span className="text-xs text-text-muted">
                      {safeDate(member.updatedAt)}
                    </span>
                  </Td>

                  <Td>
                    <span className="text-xs text-text-muted">
                      {safeDate(member.createdAt)}
                    </span>
                  </Td>

                  <Td>
                    <div className="flex items-center gap-1">
                      {/* Activity */}
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                        title="View Activity"
                        onClick={() => onNavigate("activity-log")}
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                        title="Edit"
                        onClick={() => openEditModal(member)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Reset Password - not implemented yet */}
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted opacity-40 cursor-not-allowed"
                        title="Reset Password (coming soon)"
                        disabled
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      {/* Enable / Disable */}
                      {member.isActive ? (
                        <button
                          className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Disable"
                          disabled={saving}
                          onClick={() => setConfirmDisable(member.id)}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-success hover:bg-success/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Enable"
                          disabled={saving}
                          onClick={() =>
                            void handleStatusChange(member.id, true)
                          }
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Force Logout - not implemented yet */}
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted opacity-40 cursor-not-allowed"
                        title="Force Logout (coming soon)"
                        disabled
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>

      {/* Create / Edit Staff Modal */}
      <Modal
        open={createModal}
        onClose={() => {
          if (!saving) {
            setCreateModal(false);
            setEditingStaff(null);
          }
        }}
        title={editingStaff ? "Edit Staff Account" : "Create Admin Account"}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={() => {
                setCreateModal(false);
                setEditingStaff(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={saving}
              onClick={() => void handleSubmit()}
            >
              {saving
                ? "Saving..."
                : editingStaff
                  ? "Save Changes"
                  : "Create Account"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Full Name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
              placeholder="e.g. Arjun Nair"
              disabled={saving}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Email Address
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
              className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
              placeholder="name@corevault.in"
              disabled={saving}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Role
            </label>

            <select
              value={form.role}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  role: e.target.value as AdminStaffRole,
                }))
              }
              className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-2.5 focus:outline-none focus:ring-1 focus:ring-brand/40"
              disabled={saving}
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {!editingStaff && (
            <p className="text-[11px] text-text-muted">
              A temporary password is generated for the new staff account. Email
              delivery will be added with the proper invitation/reset-password
              flow.
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDisable}
        onClose={() => {
          if (!saving) {
            setConfirmDisable(null);
          }
        }}
        onConfirm={() => {
          if (confirmDisable) {
            void handleStatusChange(confirmDisable, false);
          }
        }}
        title="Disable Staff Account"
        message="This will prevent the staff member from logging in. You can re-enable the account later."
        confirmLabel={saving ? "Disabling..." : "Disable Account"}
        severity="danger"
      />
    </div>
  );
}
