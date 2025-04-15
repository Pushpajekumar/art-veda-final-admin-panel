import CreateCategory from "@/components/categories/create-category";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { database, Query } from "@/appwrite";
import CreateSubCategory from "@/components/subcategories/create-subcategorie";
// import { Models } from "appwrite";

const page = async () => {
  const [subCategories, categories] = await Promise.all([
    database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
      process.env.NEXT_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID as string
    ),
    database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
      process.env.NEXT_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID as string,
      [Query.select(["$id", "name"])]
    ),
  ]);

  // Transform the documents to the required format
  const categoriesWithRequiredProps = categories.documents.map((doc) => ({
    $id: doc.$id,
    name: doc.name as string,
  }));

  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold ">Sub Categories</h1>
        <CreateSubCategory categories={categoriesWithRequiredProps} />
      </div>

      <div className="mt-8">
        <Table className="border rounded-lg overflow-hidden shadow-sm">
          <TableCaption className="text-slate-500 mb-2">
            List of all sub categories
          </TableCaption>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px] font-semibold text-center">
                No.
              </TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subCategories.documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-6 text-slate-500"
                >
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              subCategories.documents.map((category, index) => (
                <TableRow
                  key={category.$id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium text-center">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(category.$createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default page;
