import React from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { MoveRight } from "lucide-react";
import Link from "next/link";

interface TemplateCardProps {
  image: string;
  name?: string;
  createdAt: string;
  id: string;
}

const TemplateCard = ({ image, name, createdAt, id }: TemplateCardProps) => {
  return (
    <div className="max-w-xs overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div className="relative">
        <div className="aspect-ratio-4/3 w-full h-48 relative overflow-hidden">
          <Image
            src={image}
            alt={name || "Template"}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>
        <div className="p-2 bg-gradient-to-b from-white to-gray-50">
          {name && (
            <h2 className="text-xl font-bold mb-1 text-gray-800 truncate">
              {name}
            </h2>
          )}
          <p className="text-sm text-gray-500 font-medium">
            Created: {new Date(createdAt).toLocaleDateString()}
          </p>

          <Link href={`/admin/posts/${id}`}>
            <Button className="mt-1">
              View Details <MoveRight />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
