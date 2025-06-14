"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "./data-table";
import { ViewUserDialog } from "./view-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";

// Define your user type to match the page
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isPremium: boolean;
  profileImage?: string;
  createdAt: string;
  address?: string;
  occupation?: string;
  gender?: string;
};

export const createColumns = (
  onUserUpdated: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "profileImage",
    header: "P. Picture",
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.getValue("profileImage") ? (
          <img
            src={row.getValue("profileImage") as string}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xs text-gray-600">
              {(row.getValue("name") as string)?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    ),
  },
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
          <span className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleDateString()}
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

// Default export with empty callback for backward compatibility
export const columns = createColumns(() => {});
