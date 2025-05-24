import React, { useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { MoveRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { database } from "@/appwrite";
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

interface TemplateCardProps {
  image: string;
  name?: string;
  createdAt: string;
  id: string;
  onDelete?: (id: string) => void;
}

const TemplateCard = ({
  image,
  name,
  createdAt,
  id,
  onDelete,
}: TemplateCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await database.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID!,
        id
      );

      toast.success("Template deleted successfully");

      // Call onDelete callback to update parent component
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-xs overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div className="relative">
        <div className="aspect-ratio-4/3 w-full h-48 relative overflow-hidden">
          <Image
            src={image}
            alt={name || "Template"}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />

          {/* Delete button positioned on top-right of image */}
          <div className="absolute top-2 right-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the template "{name || "Untitled Template"}" and remove all
                    associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="p-2 bg-gradient-to-b from-white to-gray-50">
          {name && (
            <h2 className="text-xl font-bold mb-1 text-gray-800 truncate">
              {name}
            </h2>
          )}
          <p className="text-sm text-gray-500 font-medium">
            Created: {new Date(createdAt).toLocaleDateString()}
          </p>

          <Link href={`/admin/posts/${id}`}>
            <Button className="mt-1 w-full">
              View Details <MoveRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
