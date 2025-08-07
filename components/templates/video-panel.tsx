"use client";
import { database } from "@/appwrite";
import { useEditorStore } from "@/store/editor-store";
import { addVideoToCanvas } from "@/utils/fabric-utils";
import { Models } from "appwrite";
import React, { useEffect } from "react";
import { toast } from "sonner";
const VideoPanel = () => {
  const { canvas } = useEditorStore();

  const [videos, setVideos] = React.useState<Models.Document[]>([]);
  useEffect(() => {
    async function getVideos() {
      const response = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_TESTING_VIDEO_COLLECTION_ID!,
        []
      );

      console.log(response, "response from video panel");

      if (response.documents) {
        setVideos(response.documents);
      }
    }

    getVideos();
  }, []);

  console.log(videos, "videos from video panel");

  const handleAddVideo = (videoUrl: string) => {
    if (!canvas) return;
    addVideoToCanvas(canvas, videoUrl);
    toast.success("Video added to canvas");
  };

  return (
    <div>
      <h2>Video Panel</h2>
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div
              key={video.$id}
              className="border rounded-lg p-4 shadow-md"
              onClick={() => handleAddVideo(video.videoUrl)}
            >
              <video
                controls
                className="w-full h-32 object-cover rounded"
                preload="metadata"
              >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <h3 className="mt-2 font-semibold">{video.title}</h3>
              {video.name && (
                <p className="text-gray-600 text-sm mt-1">{video.name}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No videos found.</p>
      )}
    </div>
  );
};

export default VideoPanel;
