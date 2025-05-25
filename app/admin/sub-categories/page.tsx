"use client";
import CreateCategory from "@/components/categories/create-category";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { database, Query } from "@/appwrite";
import { CreateSubCategory } from "@/components/subcategories/create-subcategorie";
import { Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Page = () => {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    category: "",
    isOnHomescreen: false,
    numbering: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subCategoriesData, categoriesData] = await Promise.all([
          database.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
            process.env
              .NEXT_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID as string
          ),
          database.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
            process.env.NEXT_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID as string,
            [Query.select(["$id", "name"])]
          ),
        ]);

        console.log(subCategoriesData.documents);
        setSubCategories(subCategoriesData.documents);

        // Transform the documents to the required format
        const categoriesWithRequiredProps = categoriesData.documents.map(
          (doc) => ({
            $id: doc.$id,
            name: doc.name as string,
          })
        );
        setCategories(categoriesWithRequiredProps);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch subcategories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    setDeletingId(subCategoryId);
    try {
      await database.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
        subCategoryId
      );

      toast.success("Subcategory deleted successfully");
      setSubCategories((prev) =>
        prev.filter((subCategory) => subCategory.$id !== subCategoryId)
      );
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error("Failed to delete subcategory");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSubCategory = async () => {
    if (!editFormData.name.trim()) {
      toast.error("Subcategory name cannot be empty");
      return;
    }

    if (!editFormData.category) {
      toast.error("Please select a category");
      return;
    }

    setIsUpdating(true);
    try {
      await database.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
        editingId!,
        {
          name: editFormData.name.trim(),
          category: editFormData.category,
          isOnHomescreen: editFormData.isOnHomescreen,
          numbering: editFormData.numbering,
        }
      );

      toast.success("Subcategory updated successfully");
      setSubCategories((prev) =>
        prev.map((subCategory) =>
          subCategory.$id === editingId
            ? {
                ...subCategory,
                name: editFormData.name.trim(),
                category: categories.find(
                  (cat) => cat.$id === editFormData.category
                ),
                isOnHomescreen: editFormData.isOnHomescreen,
                numbering: editFormData.numbering,
              }
            : subCategory
        )
      );
      setIsEditDialogOpen(false);
      resetEditForm();
    } catch (error) {
      console.error("Error updating subcategory:", error);
      toast.error("Failed to update subcategory");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditDialog = (subCategory: any) => {
    setEditFormData({
      name: subCategory.name,
      category: subCategory.category.$id || subCategory.category,
      isOnHomescreen: subCategory.isOnHomescreen,
      numbering: subCategory.numbering || 1,
    });
    setEditingId(subCategory.$id);
    setIsEditDialogOpen(true);
  };

  const resetEditForm = () => {
    setEditFormData({
      name: "",
      category: "",
      isOnHomescreen: false,
      numbering: 1,
    });
    setEditingId(null);
    setIsUpdating(false);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    resetEditForm();
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold ">Sub Categories</h1>
        <CreateSubCategory categories={categories} />
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
              <TableHead className="font-semibold">On Home</TableHead>
              <TableHead className="font-semibold">Numbering</TableHead>
              <TableHead className="font-semibold">Created At</TableHead>
              <TableHead className="w-[150px] font-semibold text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-slate-500"
                >
                  No subcategories found
                </TableCell>
              </TableRow>
            ) : (
              subCategories.map((category, index) => (
                <TableRow
                  key={category.$id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium text-center">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-center">
                    {category.isOnHomescreen ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-center">
                    {category.numbering || "-"}
                  </TableCell>
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
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Edit Button */}
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(category)}
                        disabled={isUpdating || editingId === category.$id}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      {/* Delete Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            disabled={deletingId === category.$id || isUpdating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the subcategory "
                              {category.name}" and may affect all templates
                              associated with it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteSubCategory(category.$id)
                              }
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingId === category.$id}
                            >
                              {deletingId === category.$id
                                ? "Deleting..."
                                : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Update the subcategory details. Click save to apply changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Subcategory Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                placeholder="Enter subcategory name"
                disabled={isUpdating}
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={editFormData.category}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, category: value })
                }
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.$id} value={category.$id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* On Home Screen Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>On Home Screen</Label>
                <p className="text-sm text-gray-500">
                  Show this subcategory on the home screen
                </p>
              </div>
              <Switch
                checked={editFormData.isOnHomescreen}
                onCheckedChange={(checked) =>
                  setEditFormData({ ...editFormData, isOnHomescreen: checked })
                }
                disabled={isUpdating}
              />
            </div>

            {/* Numbering Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-numbering">Numbering</Label>
              <Input
                id="edit-numbering"
                type="number"
                value={editFormData.numbering}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    numbering: parseInt(e.target.value) || 1,
                  })
                }
                placeholder="Enter numbering"
                disabled={isUpdating}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubCategory}
              disabled={
                isUpdating ||
                !editFormData.name.trim() ||
                !editFormData.category
              }
              className="min-w-[80px]"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
