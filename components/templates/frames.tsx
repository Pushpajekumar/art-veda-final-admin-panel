"use client";
import { database } from "@/appwrite";
import Image from "next/image";
import React, { useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { toast } from "sonner";
import { restoreVideoObjects } from "@/utils/fabric-utils";

interface Frame {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  name: string;
  previewImage: string;
  previewImageID: string;
  template: string;
  width: number;
  height: number;
}

interface FramesResponse {
  documents: Frame[];
  total: number;
}

const Frames = () => {
  const { canvas } = useEditorStore();
  const [frames, setFrames] = React.useState<FramesResponse>({
    documents: [],
    total: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const applyFrame = async (frame: Frame) => {
    if (!canvas) {
      toast.error("Canvas not available");
      return;
    }

    try {
      const frameData = JSON.parse(frame.template);

      // Clear current canvas
      canvas.clear();

      // Set canvas background if specified in frame
      if (frameData.background) {
        canvas.backgroundColor = frameData.background;
        canvas.renderAll();
      }

      // Import fabric for enliven
      const { util } = await import("fabric");

      // Enliven objects from frame data
      const objects = await util.enlivenObjects(frameData.objects);

      // Process each object before adding to canvas
      objects.forEach((obj: any) => {
        // Set default label if not present
        if (!obj.hasOwnProperty("label")) {
          obj.set({
            label:
              obj.type === "text" ||
              obj.type === "i-text" ||
              obj.type === "textbox"
                ? `Text: ${(obj as any).text.substring(0, 10)}...`
                : `${obj.type || "Object"}`,
          });
        }

        // Add object to canvas
        canvas.add(obj);
      });

      // Restore video objects if any
      await restoreVideoObjects(canvas);

      // Set canvas dimensions if specified in frame
      if (frameData.width && frameData.height) {
        canvas.setDimensions({
          width: frameData.width,
          height: frameData.height,
        });
      }

      canvas.renderAll();
      toast.success("Frame applied successfully!");
    } catch (error: unknown) {
      console.error("Error applying frame:", error);
      toast.error("Failed to apply frame");
    }
  };

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const response = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID!
        );
        setFrames(response as unknown as FramesResponse);
        console.log(response);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching frames:", err);
        setError("Failed to fetch frames");
        setLoading(false);
      }
    };

    fetchFrames();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Frames</h3>

        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <p>{error}</p>
          ) : (
            frames.documents?.map((frame: any) => (
              <div key={frame.$id} className="flex flex-col">
                <Image
                  src={frame.previewImage}
                  alt={frame.name}
                  className="w-full h-full object-cover rounded-md"
                  width={200}
                  height={200}
                />
                <p>{frame.name}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Frames;
