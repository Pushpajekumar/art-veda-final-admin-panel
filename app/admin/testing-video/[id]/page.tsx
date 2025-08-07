import Editor from "@/components/templates/editor";
import Header from "@/components/templates/header";
import React from "react";

const page = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const templates = {
    template: {},
    width: 800,
    height: 600,
  };

  return (
    <div>
      <Header />
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
