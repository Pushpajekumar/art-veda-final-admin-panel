"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  FilterFn,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Helper function to format ISO date strings
const formatDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState<TData[]>(data);

  // Enhanced filter function to search across multiple fields including formatted dates
  const globalFilterFn: FilterFn<TData> = (row, columnId, value) => {
    const rowData = row.original as any;

    // Format createdAt for search if it exists
    const formattedCreatedAt = rowData.createdAt
      ? formatDate(rowData.createdAt)
      : "";

    return (
      rowData.name?.toLowerCase().includes(value.toLowerCase()) ||
      rowData.email?.toLowerCase().includes(value.toLowerCase()) ||
      rowData.phone?.toLowerCase().includes(value.toLowerCase()) ||
      formattedCreatedAt.toLowerCase().includes(value.toLowerCase()) ||
      Object.values(rowData).some(
        (val) =>
          typeof val === "string" &&
          val.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: searchValue,
    },
    onGlobalFilterChange: setSearchValue,
    globalFilterFn,
  });

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, phone, or date..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 max-w-sm bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-200">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-gray-700 py-3 px-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`hover:bg-gray-50 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
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
                  className="h-32 text-center text-gray-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{table.getRowModel().rows.length} results</span>
        {searchValue && <span>Filtered from {data.length} total records</span>}
      </div>
    </div>
  );
}

// Export the formatDate function for use in other components
export { formatDate };
