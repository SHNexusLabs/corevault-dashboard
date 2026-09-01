"use client";

import { useState } from "react";
import { Activity, Filter, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput, Select } from "@/components/ui/Input";
import {
  Table,
  Thead,
  Tbody,
  Th,
  Td,
  Tr,
  Pagination,
} from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import { MOCK_ACTIVITY_LOGS } from "@/lib/data";

const MODULE_COLORS: Record<string, string> = {
  Orders: "bg-blue-500/15 text-blue-300",
  Inventory: "bg-cyan-500/15 text-cyan-300",
  Staff: "bg-purple-500/15 text-purple-300",
  Roles: "bg-indigo-500/15 text-indigo-300",
  Products: "bg-emerald-500/15 text-emerald-300",
  Settings: "bg-amber-500/15 text-amber-300",
};

export function ActivityLog() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const modules = [...new Set(MOCK_ACTIVITY_LOGS.map((l) => l.module))];
  const users = [...new Set(MOCK_ACTIVITY_LOGS.map((l) => l.userName))];

  const filtered = MOCK_ACTIVITY_LOGS.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.action.toLowerCase().includes(q) ||
      l.target.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q);
    const matchModule = !moduleFilter || l.module === moduleFilter;
    const matchUser = !userFilter || l.userName === userFilter;
    return matchSearch && matchModule && matchUser;
  });

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-text-muted" />
            <h2 className="text-sm font-semibold text-text">Activity Log</h2>
            <span className="text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full font-mono">
              {MOCK_ACTIVITY_LOGS.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center gap-2 flex-wrap border-b border-border">
          <SearchInput
            className="w-52"
            placeholder="Search actions, targets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
          <Button
            variant="ghost"
            size="sm"
            icon={<Filter className="w-3.5 h-3.5" />}
          >
            Date Range
          </Button>
        </div>

        <Table>
          <Thead>
            <tr>
              <Th>User</Th>
              <Th>Action</Th>
              <Th>Module</Th>
              <Th>Target</Th>
              <Th>Previous</Th>
              <Th>New Value</Th>
              <Th sortable>Timestamp</Th>
            </tr>
          </Thead>
          <Tbody>
            {paged.map((log) => (
              <Tr key={log.id}>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand-muted border border-brand/20 flex items-center justify-center text-[9px] font-bold text-brand">
                      {log.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {log.userName}
                    </span>
                  </div>
                </Td>
                <Td>
                  <span className="text-xs text-text">{log.action}</span>
                </Td>
                <Td>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium font-mono ${MODULE_COLORS[log.module] || "bg-surface-elevated text-text-muted"}`}
                  >
                    {log.module}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs font-mono text-brand">
                    {log.target}
                  </span>
                </Td>
                <Td>
                  {log.previousValue ? (
                    <span className="text-xs text-text-muted font-mono max-w-25 truncate block">
                      {log.previousValue}
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </Td>
                <Td>
                  {log.newValue ? (
                    <span className="text-xs text-success font-mono max-w-25 truncate block">
                      {log.newValue}
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </Td>
                <Td>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </span>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Pagination
          page={page}
          total={filtered.length}
          perPage={perPage}
          onChange={setPage}
        />
      </Card>
    </div>
  );
}
