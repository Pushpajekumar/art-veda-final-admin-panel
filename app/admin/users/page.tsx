"use client";
import { database, Query } from "@/appwrite";
import { createColumns, User } from "@/components/users/columns"; // Import User type from columns
import { DataTable } from "@/components/users/data-table";
import React, { useEffect, useState } from "react";

const USERS_PER_PAGE = 25;

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const columns = createColumns(handleUserUpdated);

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      const offset = (page - 1) * USERS_PER_PAGE;

      const usersData = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID as string,
        [
          Query.limit(USERS_PER_PAGE),
          Query.offset(offset),
          Query.orderDesc("$createdAt"),
        ]
      );

      // Transform Appwrite documents to User objects
      const userData: User[] = usersData.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name || "",
        email: doc.email || "",
        phone: doc.phone || undefined, // Keep as optional
        isPremium: doc.isPremium || false,
        $createdAt: doc.$createdAt,
        profileImage: doc.profileImage || "",
        address: doc.address || "",
        occupation: doc.occupation || "",
        gender: doc.gender || "",
      }));

      console.log(userData);

      setUsers(userData);
      setTotalUsers(usersData.total);
      setTotalPages(Math.ceil(usersData.total / USERS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="text-sm text-gray-500">{totalUsers} total users</div>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={users}
        pagination={{
          currentPage,
          totalPages,
          totalItems: totalUsers,
          itemsPerPage: USERS_PER_PAGE,
          onPageChange: handlePageChange,
        }}
      />
    </div>
  );
};

export default Page;
