import { database } from "@/appwrite";
import Editor from "@/components/templates/editor";
import Header from "@/components/templates/header";
import React from "react";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const FrameDetailPage = async ({ params }: Props) => {
  const { id } = await params;

  // Fetch the frame data from the database
  const frame = await database.getDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID!,
    id
  );

  return (
    <div>
      <div>
        <Header isFrame={true} />
      </div>
      <Editor
        canvasData={frame.template}
        designId={id}
        canvasWidth={frame.width}
        canvasHeight={frame.height}
        isFrame={true}
      />
    </div>
  );
};

export default FrameDetailPage;
