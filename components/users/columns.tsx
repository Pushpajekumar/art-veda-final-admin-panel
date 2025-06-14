"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Crown, Mail, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isPremium: boolean;
  $createdAt: string;
  profileImage?: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "profileImage",
    header: "Profile",
    cell: ({ row }) => (
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={row.original.profileImage || "/default-avatar.png"}
          alt={row.original.name}
        />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          {row.original.name?.substring(0, 2).toUpperCase() || "??"}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Mail className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {row.original.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Phone className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {row.original.phone}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "isPremium",
    header: "Premium",
    cell: ({ row }) => (
      <Badge
        variant={row.original.isPremium ? "default" : "secondary"}
        className={
          row.original.isPremium
            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
      >
        {row.original.isPremium && <Crown className="h-3 w-3 mr-1" />}
        {row.original.isPremium ? "Premium" : "Free"}
      </Badge>
    ),
  },
  {
    accessorKey: "$createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.$createdAt);
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <span>{format(date, "MMM dd, yyyy")}</span>
        </div>
      );
    },
  },
];
