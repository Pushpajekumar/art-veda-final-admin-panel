import Templates from "@/components/templates/templates";
import TypeOfPost from "@/components/templates/type-of-post";
import React from "react";

const page = () => {
  return (
    <div>
      <TypeOfPost />
      <div className="">
        <Templates />
      </div>
    </div>
  );
};

export default page;
