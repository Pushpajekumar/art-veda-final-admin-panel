"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "./data-table";
import { ViewUserDialog } from "./view-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";

// Define your user type
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isPremium: boolean;
  createdAt: string;
  address?: string;
  occupation?: string;
  gender?: string;
};

export const createColumns = (
  onUserUpdated: (updatedUser: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-gray-600">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="text-gray-600">{row.getValue("phone") || "—"}</div>
    ),
  },
  {
    accessorKey: "isPremium",
    header: "Premium",
    cell: ({ row }) => {
      const isPremium = row.getValue("isPremium") as boolean;
      return (
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isPremium
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {isPremium ? "Premium" : "Free"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {formatDate(createdAt)}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center space-x-2">
          <ViewUserDialog user={user} />
          <EditUserDialog user={user} onUserUpdated={onUserUpdated} />
        </div>
      );
    },
  },
];

// Legacy export for backward compatibility
export const columns = createColumns(() => {});
