"use client";

import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  handleCheckInToggle,
  handleRegistrantDelete,
  handleStatusUpdate,
} from "@/lib/table-actions";
import type { FormEntry, StatusType } from "@/types/form-entries";
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

  const updateRegistrantStatus = async (id: number, newStatus: StatusType) => {
    try {
      setIsUpdating(id);
      const registrant = data.find((r) => r.id === id);
      if (registrant) {
        await handleStatusUpdate(registrant, newStatus, onDataChange);
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

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

  return (
    <div className="w-full space-y-6">
      {/* Filters */}
      <TableFilters
        table={table}
        searchColumn={searchColumn}
        searchValue={searchValue}
        statusFilter={statusFilter}
        checkInFilter={checkInFilter}
        onSearchColumnChange={handleSearchColumnChange}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onCheckInFilterChange={handleCheckInFilterChange}
      />

      {/* Table Content */}
      <DataTableContent table={table} columns={columns} />

      {/* Pagination */}
      <TablePagination table={table} />
    </div>
  );
}
