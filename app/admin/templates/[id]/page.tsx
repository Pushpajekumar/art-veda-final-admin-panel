import React from "react";

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

const page = async ({ params }: Props) => {
  const { id } = await params;
  return (
    <div>
      <p>template Details here</p>
      <p>Template ID: {id}</p>
    </div>
  );
};

export default page;
