"use client";
import React from "react";
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
import { database, ID } from "@/appwrite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "../ui/switch";

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

const CreateSubCategory = ({ categories }: CreateSubCategoryProps) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subCategoryName: "",
      category: "",
      on_homeScreen: false,
      numbering: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
        ID.unique(),
        {
          name: values.subCategoryName,
          category: values.category,
          isOnHomescreen: values.on_homeScreen,
          numbering: values.numbering || 1,
        }
      );
      toast.success("Subcategory created successfully!");
      form.reset();
    } catch (error) {
      console.error("Error creating subcategory:", error);
      toast.error("Error creating subcategory");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Create Subcategory</Button>
      </DialogTrigger>
      <DialogContent>
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
              <Button type="submit" isLoading={isLoading}>
                Create
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubCategory;
