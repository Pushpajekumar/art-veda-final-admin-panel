import { database } from "@/appwrite";
import { columns } from "@/components/users/columns";
import { DataTable } from "@/components/users/data-table";
import React from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isPremium: boolean;
};

const page = async () => {
  const users = await database.listDocuments(
   '6815de2b0004b53475ecs',
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
  }));

  return (
    <div className="p-3">
      {/* @ts-ignore */}
      <DataTable columns={columns} data={userData} />
    </div>
  );
};

export default page;
