"use client";
import React, { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Camera,
  Plus,
} from "lucide-react";
import { CustomeButton } from "./custome-create-button";
import { Button } from "../ui/button";
import { ID } from "appwrite";
import { database } from "@/appwrite";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const postTypes = [
  {
    name: "Facebook",
    icon: Facebook,
    width: 1200,
    height: 630,
  },
  {
    name: "Twitter",
    icon: Twitter,
    width: 1200,
    height: 675,
  },
  {
    name: "Instagram",
    icon: Instagram,
    width: 1080,
    height: 1080,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    width: 1200,
    height: 627,
  },
  {
    name: "YouTube",
    icon: Youtube,
    width: 1280,
    height: 720,
  },
  {
    name: "Snapchat",
    icon: Camera, // Using Camera as placeholder since Lucide doesn't have a Snapchat icon
    width: 1080,
    height: 1920,
  },
];

interface TypeOfPostProps {
  onSelectPostType?: (type: {
    name: string;
    width: number;
    height: number;
  }) => void;
}

const TypeOfPost: React.FC<TypeOfPostProps> = ({ onSelectPostType }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelectType = (type: (typeof postTypes)[0]) => {
    setSelectedType(type.name);
    if (onSelectPostType) {
      onSelectPostType({
        name: type.name,
        width: type.width,
        height: type.height,
      });
    }
  };
  const handleCreatePost = async () => {
    // Handle the creation of the post
    console.log("Creating post of type:", selectedType);
    setIsLoading(true);

    try {
      const width = postTypes.find((type) => type.name === selectedType)?.width;
      const height = postTypes.find(
        (type) => type.name === selectedType
      )?.height;
      if (width && height) {
        const template = await database.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_TEMPLATE_COLLECTION_ID!,
          ID.unique(),
          { width: width, height: height }
        );
        console.log(template);
        toast.success("Custom banner created successfully");
        router.push(
          `/admin/templates/${template.$id}?width=${width}&height=${height}`
        );
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6 bg-white p-5 rounded-md">
      <p className="font-semibold text-xl mb-3">
        Select the type of post you want to create
      </p>
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 max-w-3xl">
          {postTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <div
                key={type.name}
                className={`border rounded-md p-3 flex flex-col items-center cursor-pointer transition-all ${
                  selectedType === type.name
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleSelectType(type)}
              >
                <div className="mb-2">
                  <IconComponent size={24} />
                </div>
                <span className="text-sm">{type.name}</span>
                <span className="text-xs text-gray-500">
                  {type.width}×{type.height}
                </span>
              </div>
            );
          })}
          <div className="col-span-2 md:col-span-6 flex justify-center mt-4 gap-5">
            <Button
              onClick={handleCreatePost}
              disabled={!selectedType || isLoading}
              isLoading={isLoading}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Plus /> Create Post
                </>
              )}
            </Button>

            <CustomeButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeOfPost;
