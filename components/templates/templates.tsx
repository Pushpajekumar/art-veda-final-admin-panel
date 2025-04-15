import { database } from "@/appwrite";
import React from "react";
import TemplateCard from "./template-card";

const Templates = async () => {
  const templates = await database.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_TEMPLATE_COLLECTION_ID!
  );

  console.log(templates);
  return (
    <div className="grid grid-cols-1 p-5 bg-neutral-50  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {templates.documents.map((template) => (
        <TemplateCard
          key={template.$id}
          image={template.previewImage}
          name={template.name}
          id={template.$id}
          createdAt={new Date(template.$createdAt).toLocaleString()}
        />
      ))}
    </div>
  );
};

export default Templates;
