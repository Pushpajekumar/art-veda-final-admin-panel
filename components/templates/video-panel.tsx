"use client";
import { database, ID, storage, Query } from "@/appwrite";
import { useEditorStore } from "@/store/editor-store";
import {
  addVideoToCanvas,
  toggleVideoPlayback,
  pauseAllVideos,
  playAllVideos,
} from "@/utils/fabric-utils";
import { Models } from "appwrite";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Upload,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const VIDEOS_PER_PAGE = 12;

const VideoPanel = () => {
  const { canvas } = useEditorStore();

  const [videos, setVideos] = useState<Models.Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isAllPaused, setIsAllPaused] = useState(false);

  const getUploadedVideos = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const offset = (page - 1) * VIDEOS_PER_PAGE;

      const response = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_TESTING_VIDEO_COLLECTION_ID!,
        [
          Query.limit(VIDEOS_PER_PAGE),
          Query.offset(offset),
          Query.orderDesc("$createdAt"),
        ]
      );

      console.log(response, "response from video panel");

      if (response.documents) {
        setVideos(response.documents);
        setTotal(response.total);
        setTotalPages(Math.ceil(response.total / VIDEOS_PER_PAGE));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getUploadedVideos(currentPage);
  }, [getUploadedVideos, currentPage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

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

  const handleUploadVideo = async () => {
    try {
      if (!selectedFile) return;

      setIsUploading(true);

      const video = await storage.createFile(
        process.env.NEXT_PUBLIC_BUCKET_ID!,
        ID.unique(),
        selectedFile
      );

      const videoUrl = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${video.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

      await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_TESTING_VIDEO_COLLECTION_ID!,
        ID.unique(),
        {
          name: selectedFile.name,
          title: selectedFile.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          videoUrl: videoUrl,
          fileId: video.$id,
        }
      );

      toast.success("Video uploaded successfully");
      await getUploadedVideos(1); // Go to first page to see the new upload
      clearSelectedFile();
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Error uploading video");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePageChange = (page: number) => {
    getUploadedVideos(page);
  };

  const handleAddVideo = async (videoUrl: string) => {
    if (!canvas) {
      toast.error("Canvas not available");
      return;
    }

    console.log("Attempting to add video:", videoUrl);

    try {
      const videoObject = await addVideoToCanvas(canvas, videoUrl);
      if (videoObject) {
        toast.success("Video added to canvas");
      } else {
        toast.error("Failed to add video to canvas");
      }
    } catch (error) {
      console.error("Error adding video:", error);
      toast.error("Failed to add video: " + (error as Error).message);
    }
  };

  const handleTogglePlayback = () => {
    if (!canvas) return;
    toggleVideoPlayback(canvas);
  };

  const handleToggleAllVideos = () => {
    if (!canvas) return;
    if (isAllPaused) {
      playAllVideos(canvas);
    } else {
      pauseAllVideos(canvas);
    }
    setIsAllPaused(!isAllPaused);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Video Controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleToggleAllVideos}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            {isAllPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            {isAllPaused ? "Play All" : "Pause All"}
          </button>
        </div>

        {/* File selection area */}
        <div className="space-y-4">
          <Label
            htmlFor="video-upload"
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white
            rounded-md cursor-pointer h-12 font-medium transition-colors ${
              isUploading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>Select Video</span>
            <Input
              id="video-upload"
              type="file"
              className="hidden"
              accept="video/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </Label>

          {/* Preview selected file */}
          {previewUrl && (
            <div className="mt-4 relative">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Selected Video</h4>
                <button
                  onClick={clearSelectedFile}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative aspect-video bg-gray-50 rounded-md overflow-hidden">
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                />
              </div>
              <button
                onClick={handleUploadVideo}
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
                  "Upload Video"
                )}
              </button>
            </div>
          )}
        </div>

        {/* User uploads section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Your Videos</h4>
            {total > 0 && (
              <span className="text-xs text-gray-500">{total} videos</span>
            )}
          </div>

          {isLoading ? (
            <div className="border p-6 flex items-center justify-center gap-3 rounded-md">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <p className="text-sm">Loading your videos...</p>
            </div>
          ) : videos.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {videos.map((video) => (
                  <div
                    key={video.$id}
                    className="border rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleAddVideo(video.videoUrl)}
                  >
                    <video
                      src={video.videoUrl}
                      className="w-full h-24 object-cover rounded mb-2"
                      preload="metadata"
                      muted
                      onError={(e) => {
                        console.error("Video preview error:", e);
                        // Hide broken video preview
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <h3 className="text-sm font-semibold truncate">
                      {video.title}
                    </h3>
                    {video.name && (
                      <p className="text-gray-600 text-xs mt-1 truncate">
                        {video.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination for videos */}
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
              <p>No videos yet</p>
              <p className="text-xs mt-1">
                Your uploaded videos will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPanel;
