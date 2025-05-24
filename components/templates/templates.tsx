"use client";
import { database } from "@/appwrite";
import React, { useEffect, useState } from "react";
import TemplateCard from "./template-card";

const Templates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templatesData = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID!
        );
        setTemplates(templatesData.documents);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleDeleteTemplate = (deletedId: string) => {
    setTemplates((prev) => prev.filter((template) => template.$id !== deletedId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 p-5 bg-neutral-50 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.$id}
          image={template.previewImage}
          name={template.name}
          id={template.$id}
          createdAt={new Date(template.$createdAt).toLocaleString()}
          onDelete={handleDeleteTemplate}
        />
      ))}
    </div>
  );
};

export default Templates;
