import { database } from "@/appwrite";
import Editor from "@/components/templates/editor";
import Header from "@/components/templates/header";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const templates = await database.getDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_VIDEO_COLLECTION_ID!,
    id
  );

  return (
    <div>
      <Header isVideo />
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
