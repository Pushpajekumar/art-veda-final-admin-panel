"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { database } from "@/appwrite";
import Link from "next/link";
import Image from "next/image";
import CreateFrame from "@/components/frames/create-frame";
import { Trash2 } from "lucide-react";
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

const Page = () => {
  const [frames, setFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const framesData = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID as string
        );
        setFrames(framesData.documents);
      } catch (error) {
        console.error("Error fetching frames:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFrames();
  }, []);

  const handleDeleteFrame = async (frameId: string) => {
    setDeletingId(frameId);
    try {
      await database.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID!,
        frameId
      );

      toast.success("Frame deleted successfully");
      setFrames((prev) => prev.filter((frame) => frame.$id !== frameId));
    } catch (error) {
      console.error("Error deleting frame:", error);
      toast.error("Failed to delete frame");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Frames</h1>
        <CreateFrame />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frames.length === 0 ? (
          <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-500">No frames found</p>
            <p className="text-sm text-gray-400 mt-2">
              Create your first frame to get started
            </p>
          </div>
        ) : (
          frames.map((frame: any) => (
            <Card
              key={frame.$id}
              className="overflow-hidden transition-shadow hover:shadow-lg relative"
            >
              {/* Delete button positioned on top-right */}
              <div className="absolute top-2 right-2 z-10">
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
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the frame "{frame.name || "Untitled Frame"}" and
                        remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteFrame(frame.$id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deletingId === frame.$id}
                      >
                        {deletingId === frame.$id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <CardContent className="p-0">
                <Link href={`/admin/frames/${frame.$id}`}>
                  <div className="aspect-video relative bg-slate-100">
                    {frame.previewImage ? (
                      <Image
                        src={frame.previewImage}
                        alt={frame.name || "Frame preview"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No preview
                      </div>
                    )}
                  </div>
                </Link>
              </CardContent>
              <CardFooter className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    {frame.name || "Untitled Frame"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {new Date(frame.$createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/admin/frames/${frame.$id}`}>Edit</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;
