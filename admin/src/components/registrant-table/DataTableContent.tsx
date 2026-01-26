"use client";

import { flexRender, Table, ColumnDef } from "@tanstack/react-table";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FormEntry } from "@/types/form-entries";

interface DataTableContentProps {
  table: Table<FormEntry>;
  columns: ColumnDef<FormEntry>[];
}

export function DataTableContent({ table, columns }: DataTableContentProps) {
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <UITable className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-200">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        header.column.id === "actions"
                          ? "md:sticky md:right-0 z-10 bg-white border-l-2 border-gray-200 min-w-[200px] text-gray-900 font-semibold"
                          : header.column.id === "is_checked_in"
                          ? "min-w-[150px] text-gray-900 font-semibold"
                          : header.column.id === "first_name"
                          ? "min-w-[150px] text-gray-900 font-semibold"
                          : header.column.id === "dietary_restrictions"
                          ? "min-w-[200px] text-gray-900 font-semibold"
                          : header.column.id === "why_join"
                          ? "min-w-[250px] text-gray-900 font-semibold"
                          : header.column.id === "scholarship_type"
                          ? "min-w-[150px] text-gray-900 font-semibold"
                          : "min-w-[100px] text-gray-900 font-semibold"
                      }
                      style={
                        header.column.id === "actions"
                          ? { right: 0 }
                          : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "actions"
                          ? "md:sticky md:right-0 z-10 bg-white border-l-2 border-gray-200 min-w-[200px] text-gray-900"
                          : cell.column.id === "is_checked_in"
                          ? "min-w-[150px] text-gray-700"
                          : cell.column.id === "first_name"
                          ? "min-w-[150px] text-gray-700"
                          : cell.column.id === "dietary_restrictions"
                          ? "min-w-[200px] text-gray-700"
                          : cell.column.id === "why_join"
                          ? "min-w-[250px] text-gray-700"
                          : cell.column.id === "scholarship_type"
                          ? "min-w-[150px] text-gray-700"
                          : "min-w-[100px] text-gray-700"
                      }
                      style={
                        cell.column.id === "actions"
                          ? { right: 0 }
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
    </div>
  );
}
