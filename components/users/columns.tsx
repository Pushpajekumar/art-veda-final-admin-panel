"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isPremium: boolean;
  $createdAt: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "isPremium",
    header: "Premium",
    cell: ({ row }) => <p>{row.original.isPremium ? "Yes" : "No"}</p>,
  },
  {
    accessorKey: "$createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.$createdAt);
      return <p>{date.toLocaleDateString()}</p>;
    },
  },
];
