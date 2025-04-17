"use client";
import { database } from "@/appwrite";
import Image from "next/image";
import React, { use, useEffect } from "react";

const Frames = () => {
  const [frames, setFrames] = React.useState<any>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const response = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID!
        );
        setFrames(response);
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
