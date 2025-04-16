import Templates from "@/components/templates/templates";
import TypeOfPost from "@/components/templates/type-of-post";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
