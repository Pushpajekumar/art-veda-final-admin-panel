"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addImageToCanvas } from "@/utils/fabric-utils";
import { useEditorStore } from "@/store/editor-store";
import { Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { database, ID, storage, Query } from "@/appwrite";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import Image from "next/image";

const IMAGES_PER_PAGE = 24;

function UploadPanel() {
  const { canvas } = useEditorStore();

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userUploads, setUserUploads] = useState<
    Array<{ _id: string; name: string; url: string }>
  >([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const getUploadedImages = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const offset = (page - 1) * IMAGES_PER_PAGE;

      const images = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_IMAGE_COLLECTION_ID!,
        [
          Query.limit(IMAGES_PER_PAGE),
          Query.offset(offset),
          Query.orderDesc("$createdAt"),
        ]
      );

      const formattedImages = images.documents.map((image: any) => ({
        _id: image.$id,
        name: image.name,
        url: image.url,
      }));

      setUserUploads(formattedImages);
      setTotal(images.total);
      setTotalPages(Math.ceil(images.total / IMAGES_PER_PAGE));
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load your uploads");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getUploadedImages(currentPage);
  }, [getUploadedImages, currentPage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  const clearSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleUploadImage = async () => {
    try {
      if (!selectedFile) return;

      setIsUploading(true);

      const image = await storage.createFile(
        process.env.NEXT_PUBLIC_BUCKET_ID!,
        ID.unique(),
        selectedFile
      );

      const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${image.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

      await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_IMAGE_COLLECTION_ID!,
        ID.unique(),
        {
          name: selectedFile.name,
          url: imageUrl,
          fileId: image.$id,
        }
      );

      toast.success("File uploaded successfully");
      await getUploadedImages(1); // Go to first page to see the new upload
      clearSelectedFile();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePageChange = (page: number) => {
    getUploadedImages(page);
  };

  const handleAddImage = (imageUrl: string) => {
    if (!canvas) return;
    addImageToCanvas(canvas, imageUrl);
    toast.success("Image added to canvas");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* File selection area */}
        <div className="space-y-4">
          <Label
            htmlFor="image-upload"
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white
            rounded-md cursor-pointer h-12 font-medium transition-colors ${
              isUploading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>Select Image</span>
            <Input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </Label>

          {/* Preview selected file */}
          {previewUrl && (
            <div className="mt-4 relative">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Selected Image</h4>
                <button
                  onClick={clearSelectedFile}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative aspect-video bg-gray-50 rounded-md overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
              <button
                onClick={handleUploadImage}
                disabled={isUploading}
                className={`mt-3 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors ${
                  isUploading
                    ? "opacity-70 cursor-not-allowed flex justify-center items-center"
                    : ""
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Image"
                )}
              </button>
            </div>
          )}
        </div>

        {/* User uploads section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Your Uploads</h4>
            {total > 0 && (
              <span className="text-xs text-gray-500">{total} images</span>
            )}
          </div>

          {isLoading ? (
            <div className="border p-6 flex items-center justify-center gap-3 rounded-md">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <p className="text-sm">Loading your uploads...</p>
            </div>
          ) : userUploads.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {userUploads.map((imageData) => (
                  <div
                    className="aspect-square bg-gray-50 rounded-md overflow-hidden hover:opacity-85 transition-opacity relative group cursor-pointer border"
                    key={imageData._id}
                    onClick={() => handleAddImage(imageData.url)}
                    title={imageData.name}
                  >
                    <Image
                      src={imageData.url}
                      alt={imageData.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                      {imageData.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for images */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-xs text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          className={`text-xs h-8 ${
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }`}
                        />
                      </PaginationItem>

                      {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage <= 2) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - 2 + i;
                          } else {
                            pageNum = currentPage - 1 + i;
                          }

                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer text-xs h-8 w-8"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          className={`text-xs h-8 ${
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-md p-6 text-center text-gray-500">
              <p>No uploads yet</p>
              <p className="text-xs mt-1">
                Your uploaded images will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadPanel;
