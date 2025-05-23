"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { database, ID, storage } from "@/appwrite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "../ui/switch";
import Image from "next/image";
import { ImageIcon, Upload, X } from "lucide-react";

const formSchema = z.object({
  subCategoryName: z.string().min(1, {
    message: "Subcategory name is required",
  }),
  category: z.string().min(1, {
    message: "Category is required",
  }),
  on_homeScreen: z.boolean(),
  numbering: z.number().optional(),
});

interface Category {
  $id: string;
  name: string;
}

interface CreateSubCategoryProps {
  categories: Category[];
}

export const CreateSubCategory = ({ categories }: CreateSubCategoryProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subCategoryName: "",
      category: "",
      on_homeScreen: false,
      numbering: 0,
    },
  });

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo image must be less than 2MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setLogoFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected logo
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setUploadProgress(0);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      let logoId = "";
      let logoUrl = "";

      // Upload logo if selected
      if (logoFile) {
        // Upload to Appwrite storage
        const uploadedFile = await storage.createFile(
          process.env.NEXT_PUBLIC_BUCKET_ID!,
          ID.unique(),
          logoFile,
          undefined
        );

        logoId = uploadedFile.$id;
        logoUrl = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${logoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      }

      // Create subcategory document
      await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
        ID.unique(),
        {
          name: values.subCategoryName,
          category: values.category,
          isOnHomescreen: values.on_homeScreen,
          numbering: values.numbering || 1,
          logoId: logoId || null,
          logoUrl: logoUrl || null,
        }
      );

      toast.success("Subcategory created successfully!");
      form.reset();
      removeLogo();
    } catch (error) {
      console.error("Error creating subcategory:", error);
      toast.error("Error creating subcategory");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Create Subcategory</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create SubCategory </DialogTitle>
          <DialogDescription>create a new subcategory</DialogDescription>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="subCategoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name of the category you are creating.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.$id} value={category.$id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="on_homeScreen"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>On Home Screen</FormLabel>
                      <FormDescription>
                        Show this category on the home screen.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numbering"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numbering</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter numbering"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : 0
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      This is the numbering for the category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Logo Upload Field */}
              <div className="space-y-2">
                <FormLabel>Subcategory Logo</FormLabel>
                <div className="flex flex-col items-center gap-4">
                  {logoPreview ? (
                    <div className="relative w-40 h-40 border rounded-md overflow-hidden">
                      <Image
                        src={logoPreview}
                        alt="Logo Preview"
                        fill
                        className="object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                        onClick={removeLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md w-40 h-40 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        No logo selected
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col items-center">
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>{logoFile ? "Change Logo" : "Upload Logo"}</span>
                      </div>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Creating..." : "Create Subcategory"}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
