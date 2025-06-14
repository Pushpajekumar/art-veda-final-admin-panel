import { database } from "@/appwrite";
import { columns } from "@/components/users/columns";
import { DataTable } from "@/components/users/data-table";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isPremium: boolean;
};

const page = async () => {
  const users = await database.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID as string
  );
  console.log(users);

  // Transform Appwrite documents to User objects
  const userData: User[] = users.documents.map((doc) => ({
    id: doc.$id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    isPremium: doc.isPremium,
    createdAt: doc.$createdAt,
  }));

  return (
    <div className="p-3">
      <DataTable columns={columns} data={userData} />
    </div>
  );
};

export default page;
