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
    <div>
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
