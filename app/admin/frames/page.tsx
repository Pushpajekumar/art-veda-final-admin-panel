import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { database } from "@/appwrite";
import Link from "next/link";
import Image from "next/image";
import CreateFrame from "@/components/frames/create-frame";

const page = async () => {
  // Fetch all frames from the database
  const frames = await database.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
    "6815de5300077ef22735"
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Frames</h1>
        <CreateFrame />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frames.documents.length === 0 ? (
          <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-500">No frames found</p>
            <p className="text-sm text-gray-400 mt-2">
              Create your first frame to get started
            </p>
          </div>
        ) : (
          frames.documents.map((frame: any) => (
            <Card
              key={frame.$id}
              className="overflow-hidden transition-shadow hover:shadow-lg"
            >
              <CardContent className="p-0">
                <Link href={`/admin/frames/${frame.$id}`}>
                  <div className="aspect-video relative bg-slate-100">
                    {frame.previewImage ? (
                      <Image
                        src={frame.previewImage}
                        alt={frame.name || "Frame preview"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No preview
                      </div>
                    )}
                  </div>
                </Link>
              </CardContent>
              <CardFooter className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    {frame.name || "Untitled Frame"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {new Date(frame.$createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/admin/frames/${frame.$id}`}>Edit</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default page;
