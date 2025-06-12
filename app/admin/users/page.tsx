"use client";
import { database } from "@/appwrite";
import { createColumns } from "@/components/users/columns";
import { DataTable } from "@/components/users/data-table";
import React, { useEffect, useState } from "react";

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

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const columns = createColumns(handleUserUpdated);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID as string
        );

        // Transform Appwrite documents to User objects
        const userData: User[] = usersData.documents.map((doc) => ({
          id: doc.$id,
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          isPremium: doc.isPremium,
          createdAt: doc.$createdAt,
          address: doc.address,
          occupation: doc.occupation,
          gender: doc.gender,
        }));

        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-3">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage user accounts and permissions</p>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
};

export default Page;
