"use client";
import { database, Query } from "@/appwrite";
import VideoTemplate from "@/components/templates/video-template";
import { Models } from "appwrite";
import React, { useEffect } from "react";

const page = () => {
  const [loading, setLoading] = React.useState(true);
  const [videoPosts, setVideoPosts] = React.useState<Models.Document[]>([]);

  useEffect(() => {
    async function fetchVideoPosts() {
      setLoading(true);
      try {
        const response = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_VIDEO_COLLECTION_ID!,
          [Query.orderDesc("$createdAt")]
        );
        setVideoPosts(response.documents);
        console.log("Fetched video posts:", response.documents);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }

    fetchVideoPosts();
  }, []);

  return (
    <div>
      <VideoTemplate />
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      ) : (
        <ul>
          {videoPosts.map((post) => (
            <li key={post.$id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default page;
