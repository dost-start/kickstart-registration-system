"use client";

import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

import {
  handleCheckInToggle,
  handleRegistrantDelete,
  handleStatusUpdate,
  handleBatchStatusUpdate,
} from "@/lib/table-actions";
import { sendQREmails } from "@/app/actions/send-qr-emails";
import type { FormEntry, StatusType } from "@/types/form-entries";
import { Button } from "@/components/ui/button";
import { DataTableContent } from "./DataTableContent";
import RegistrantTableColumns from "./RegistrantTableColumns";
import { TableFilters } from "./TableFilters";
import { TablePagination } from "./TablePagination";

interface DataTableProps {
  data: FormEntry[];
  onDataChange: () => void;
}

export function RegistrantDataTable({ data, onDataChange }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    contact_number: false,
    scholarship_type: false,
    year_awarded: false,
    dietary_restrictions: false,
    has_attended_ga: false,
    seat_assignment: false,
  });
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [searchColumn, setSearchColumn] = useState<string>("first_name");
  const [searchValue, setSearchValue] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [checkInFilter, setCheckInFilter] = useState<string>("all");
  const [islandFilter, setIslandFilter] = useState<string>("all");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const updateRegistrantStatus = async (id: number, newStatus: StatusType) => {
    try {
      setIsUpdating(id);
      const registrant = data.find((r) => r.id === id);
      if (registrant) {
        await handleStatusUpdate(registrant, newStatus, onDataChange);
        // Send QR email when status is changed to accepted
        if (newStatus === "accepted" && registrant.email && registrant.event_uid) {
          try {
            await sendQREmails([id]);
          } catch (emailErr) {
            console.error("Failed to send acceptance email:", emailErr);
          }
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const toggleCheckIn = async (registrant: FormEntry) => {
    try {
      setIsUpdating(registrant.id);
      await handleCheckInToggle(registrant, onDataChange);
    } catch (error) {
      console.error("Failed to toggle check-in:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteRegistrant = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this registrant? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsUpdating(id);
      await handleRegistrantDelete(id, onDataChange);
    } catch (error) {
      console.error("Failed to delete registrant:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const columns = RegistrantTableColumns({
    isUpdating,
    onDataChange,
    toggleCheckIn,
    updateRegistrantStatus,
    deleteRegistrant,
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleBulkStatusUpdate = async (newStatus: StatusType) => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map((row) => row.original.id);
    if (ids.length === 0) return;

    try {
      setIsBulkUpdating(true);
      await handleBatchStatusUpdate(ids, newStatus, () => {
        onDataChange();
        setRowSelection({});
      });
      // Send QR emails when bulk accepting
      if (newStatus === "accepted") {
        const toEmail = selectedRows
          .filter((r) => r.original.email && r.original.event_uid)
          .map((r) => r.original.id);
        if (toEmail.length > 0) {
          try {
            await sendQREmails(toEmail);
          } catch (emailErr) {
            console.error("Failed to send acceptance emails:", emailErr);
          }
        }
      }
    } catch (error) {
      console.error("Failed to bulk update status:", error);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Update search filter when search column or value changes
  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (searchColumn === "first_name") {
      // Custom filter for name that includes first_name, middle_name, and last_name
      table.getColumn("first_name")?.setFilterValue(value);
    } else {
      table.getColumn(searchColumn)?.setFilterValue(value);
    }
  };

  const handleSearchColumnChange = (column: string) => {
    // Clear previous filter
    table.getColumn(searchColumn)?.setFilterValue("");
    setSearchColumn(column);
    setSearchValue("");
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value === "all") {
      table.getColumn("status")?.setFilterValue("");
    } else {
      table.getColumn("status")?.setFilterValue(value);
    }
  };

  const handleCheckInFilterChange = (value: string) => {
    setCheckInFilter(value);
    if (value === "all") {
      table.getColumn("is_checked_in")?.setFilterValue("");
    } else {
      table.getColumn("is_checked_in")?.setFilterValue(value === "checked_in");
    }
  };

  const handleIslandFilterChange = (value: string) => {
    setIslandFilter(value);
    if (value === "all") {
      table.getColumn("island")?.setFilterValue("");
    } else {
      table.getColumn("island")?.setFilterValue(value);
    }
  };

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="w-full space-y-6">
      {/* Filters */}
      <TableFilters
        table={table}
        searchColumn={searchColumn}
        searchValue={searchValue}
        statusFilter={statusFilter}
        checkInFilter={checkInFilter}
        islandFilter={islandFilter}
        onSearchColumnChange={handleSearchColumnChange}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onCheckInFilterChange={handleCheckInFilterChange}
        onIslandFilterChange={handleIslandFilterChange}
      />

      {/* Bulk Status Actions */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#0f9dfe]/30 bg-[#0f9dfe]/5 px-4 py-3">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusUpdate("accepted")}
              disabled={isBulkUpdating}
              className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
            >
              {isBulkUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span className="ml-1.5">Accept</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusUpdate("pending")}
              disabled={isBulkUpdating}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400"
            >
              <Clock className="h-4 w-4" />
              <span className="ml-1.5">Pending</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusUpdate("waitlisted")}
              disabled={isBulkUpdating}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
            >
              <Clock className="h-4 w-4" />
              <span className="ml-1.5">Waitlist</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusUpdate("rejected")}
              disabled={isBulkUpdating}
              className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
            >
              <XCircle className="h-4 w-4" />
              <span className="ml-1.5">Reject</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRowSelection({})}
              className="text-gray-600 hover:bg-gray-100"
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <DataTableContent table={table} columns={columns} />

      {/* Pagination */}
      <TablePagination table={table} />
    </div>
  );
}
