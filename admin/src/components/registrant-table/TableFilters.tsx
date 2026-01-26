"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";
import type { FormEntry } from "@/types/form-entries";
import { ChevronDown } from "lucide-react";

interface TableFiltersProps {
  table: Table<FormEntry>;
  searchColumn: string;
  searchValue: string;
  statusFilter: string;
  checkInFilter: string;
  onSearchColumnChange: (column: string) => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCheckInFilterChange: (value: string) => void;
}

const searchableColumns = [
  { key: "first_name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "contact_number", label: "Contact Number" },
  { key: "university", label: "University" },
  { key: "course", label: "Course" },
  { key: "scholarship_type", label: "Scholarship Type" },
  { key: "year_awarded", label: "Year Awarded" },
  { key: "preferred_date", label: "Preferred Date" },
  { key: "dietary_restrictions", label: "Dietary Restrictions" },
  { key: "has_attended_ga", label: "Attended GA" },
  { key: "status", label: "Status" },
  { key: "is_checked_in", label: "Check-in" },
  { key: "event_uid", label: "Event UID" },
  { key: "seat_assignment", label: "Seat Assignment" },
] as const;

export function TableFilters({
  table,
  searchColumn,
  searchValue,
  statusFilter,
  checkInFilter,
  onSearchColumnChange,
  onSearchChange,
  onStatusFilterChange,
  onCheckInFilterChange,
}: TableFiltersProps) {
  return (
    <div className="flex items-start md:items-end space-x-4 gap-4 flex-wrap">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="search-column" className="text-sm font-medium text-gray-700">
          Search By
        </Label>
        <Select value={searchColumn} onValueChange={onSearchColumnChange}>
          <SelectTrigger className="w-[180px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-[#0f9dfe] focus:ring-[#0f9dfe]/20" id="search-column">
            <SelectValue placeholder="Search by..." />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            {searchableColumns.map((column) => (
              <SelectItem key={column.key} value={column.key} className="text-gray-900 hover:bg-[#0f9dfe]/10">
                {column.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="search-input" className="text-sm font-medium text-gray-700">
          Search Term
        </Label>
        <Input
          id="search-input"
          placeholder={
            searchColumn === "has_attended_ga"
              ? "Type 'yes' or 'no'..."
              : searchColumn === "is_checked_in"
              ? "Type 'yes', 'no', 'checked in', etc..."
              : searchColumn === "status"
              ? "Type pending, accepted, rejected, or waitlisted..."
              : searchColumn === "contact_number"
              ? "Enter contact number (e.g., 09XXXXXXXXX)..."
              : searchColumn === "event_uid"
              ? "Search UID (e.g., simera-dec13-0001)..."
              : searchColumn === "seat_assignment"
              ? "Search seat label (e.g., VIP Row A)..."
              : searchColumn === "dietary_restrictions"
              ? "Enter dietary restrictions..."
              : searchColumn === "year_awarded"
              ? "Enter year awarded (e.g., 2020)..."
              : `Enter ${searchableColumns.find((c) => c.key === searchColumn)?.label.toLowerCase()}...`
          }
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[250px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-[#0f9dfe] focus:ring-[#0f9dfe]/20"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          Status
        </Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-[#0f9dfe] focus:ring-[#0f9dfe]/20" id="status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="text-gray-900 hover:bg-[#0f9dfe]/10">All Status</SelectItem>
            <SelectItem value="pending" className="text-gray-900 hover:bg-[#0f9dfe]/10">Pending</SelectItem>
            <SelectItem value="accepted" className="text-gray-900 hover:bg-[#0f9dfe]/10">Accepted</SelectItem>
            <SelectItem value="rejected" className="text-gray-900 hover:bg-[#0f9dfe]/10">Rejected</SelectItem>
            <SelectItem value="waitlist" className="text-gray-900 hover:bg-[#0f9dfe]/10">Waitlist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="checkin-filter" className="text-sm font-medium text-gray-700">
          Check-in Status
        </Label>
        <Select value={checkInFilter} onValueChange={onCheckInFilterChange}>
          <SelectTrigger className="w-[140px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-[#0f9dfe] focus:ring-[#0f9dfe]/20" id="checkin-filter">
            <SelectValue placeholder="All Check-in" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="text-gray-900 hover:bg-[#0f9dfe]/10">All Check-in</SelectItem>
            <SelectItem value="checked_in" className="text-gray-900 hover:bg-[#0f9dfe]/10">Checked In</SelectItem>
            <SelectItem value="not_checked_in" className="text-gray-900 hover:bg-[#0f9dfe]/10">Not Checked In</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="columns-dropdown" className="text-sm font-medium text-gray-700">
          Columns
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" id="columns-dropdown" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-full">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="bg-white border-gray-200"
          >
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-gray-900 hover:bg-[#0f9dfe]/10"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    onSelect={(e) => e.preventDefault()}
                  >
                    {column.id === "first_name"
                      ? "Name"
                      : column.id === "email"
                      ? "Email"
                      : column.id === "contact_number"
                      ? "Contact Number"
                      : column.id === "university"
                      ? "University"
                      : column.id === "course"
                      ? "Course"
                      : column.id === "scholarship_type"
                      ? "Scholarship Type"
                      : column.id === "year_awarded"
                      ? "Year Awarded"
                      : column.id === "preferred_date"
                      ? "Preferred Date"
                      : column.id === "dietary_restrictions"
                      ? "Dietary Restrictions"
                      : column.id === "has_attended_ga"
                      ? "Attended GA"
                      : column.id === "status"
                      ? "Status"
                      : column.id === "is_checked_in"
                      ? "Check-in"
                      : column.id.replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
