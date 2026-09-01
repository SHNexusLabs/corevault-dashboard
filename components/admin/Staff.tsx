"use client";

import { useState } from "react";
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
import { formatDate, timeAgo } from "@/lib/utils";
import { MOCK_STAFF } from "@/lib/data";
import type { Page } from "@/lib/types";

interface StaffProps {
  onNavigate: (page: Page) => void;
}

export function Staff({ onNavigate }: StaffProps) {
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState<string | null>(null);

  const filtered = MOCK_STAFF.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label="Total Staff"
          value={MOCK_STAFF.length}
          icon={<UserCog className="w-5 h-5 text-brand" />}
          iconBg="bg-brand-muted border border-brand/20"
        />
        <KPICard
          label="Active"
          value={MOCK_STAFF.filter((s) => s.status === "active").length}
          icon={<UserCog className="w-5 h-5 text-success" />}
          iconBg="bg-success-muted border border-success/20"
        />
        <KPICard
          label="Admins"
          value={MOCK_STAFF.filter((s) => s.role === "admin").length}
          icon={<UserCog className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/10 border border-blue-500/20"
        />
        <KPICard
          label="Super Admins"
          value={MOCK_STAFF.filter((s) => s.role === "super_admin").length}
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
              onClick={() => setCreateModal(true)}
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
            {filtered.map((member) => (
              <Tr key={member.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-muted border border-brand/20 flex items-center justify-center text-xs font-bold text-brand shrink-0">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
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
                  <RoleBadge role={member.role} />
                </Td>
                <Td>
                  <StatusDot active={member.status === "active"} />
                </Td>
                <Td>
                  <span className="text-xs text-text-muted">
                    {timeAgo(member.lastActive)}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-text-muted">
                    {formatDate(member.createdDate).split(",")[0]}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button
                      className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                      title="View Activity"
                      onClick={() => onNavigate("activity-log")}
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Reset Password"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    {member.status === "active" ? (
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Disable"
                        onClick={() => setConfirmDisable(member.id)}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-success hover:bg-success/10 transition-colors"
                        title="Enable"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-warning hover:bg-warning/10 transition-colors"
                      title="Force Logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      {/* Create Staff Modal */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Admin Account"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateModal(false)}
            >
              Create Account
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
              className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
              placeholder="e.g. Arjun Nair"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
              placeholder="name@corevault.in"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Role
            </label>
            <select className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-2.5 focus:outline-none focus:ring-1 focus:ring-brand/40">
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <p className="text-[11px] text-text-muted">
            A temporary password will be sent to the staff member&apos;s email
            address.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDisable}
        onClose={() => setConfirmDisable(null)}
        onConfirm={() => {}}
        title="Disable Staff Account"
        message="This will prevent the staff member from logging in. You can re-enable the account later."
        confirmLabel="Disable Account"
        severity="danger"
      />
    </div>
  );
}
