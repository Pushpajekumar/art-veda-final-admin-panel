import { database } from "@/appwrite";
import Editor from "@/components/templates/editor";
import Header from "@/components/templates/header";
import React from "react";

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams?: { [key: string]: string };
}

const page = async ({ params }: Props) => {
  const { id } = await params;

  // Here you can use the id to fetch data or perform any operations
  const templates = await database.getDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_TEMPLATE_COLLECTION_ID!,
    id
  );

  console.log(templates);

  return (
    <div>
      <div>
        <Header />
      </div>
      <Editor
        canvasData={templates.template}
        designId={id}
        canvasWidth={templates.width}
        canvasHeight={templates.height}
      />
    </div>
  );
};

export default page;
