import Templates from "@/components/templates/templates";
import TypeOfPost from "@/components/templates/type-of-post";
import React from "react";

const page = () => {
  return (
    <div>
      <TypeOfPost />
      <div className="p-3 bg-white">
        <Templates />
      </div>
    </div>
  );
};

export default page;
