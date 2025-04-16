"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from "@/store/editor-store";
import { ChevronDown, Download, Eye, Pencil, SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ExportModal from "./export-modal";
import { database, ID, storage } from "@/appwrite";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function Header() {
  const {
    isEditing,
    setIsEditing,
    name,
    canvas,
    markAsModified,
    designId,
    setName,
  } = useEditorStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!canvas) return;
    canvas.selection = isEditing;
    canvas.getObjects().forEach((obj) => {
      obj.selectable = isEditing;
      obj.evented = isEditing;
    });
  }, [isEditing]);

  useEffect(() => {
    if (!canvas || !designId) return;
    markAsModified();
  }, [name, canvas, designId]);

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleSave = async () => {
    if (!canvas) return;
    setIsLoading(true);
    try {
      const dataUrl = canvas?.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
      });

      console.log(dataUrl);

      if (dataUrl) {
        // Convert dataUrl to a Blob, then to a File object
        const blob = await fetch(dataUrl).then((res) => res.blob());
        const file = new File([blob], "design.png", { type: "image/png" });

        const uploadedImage = await storage.createFile(
          process.env.NEXT_PUBLIC_BUCKET_ID as string,
          ID.unique(),
          file
        );

        const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${uploadedImage.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

        console.log(imageUrl);

        // Include lock properties in serialization
        const propertiesToInclude = [
          "id",
          "filters",
          "lockMovementX",
          "lockMovementY",
          "lockRotation",
          "lockScalingX",
          "lockScalingY",
          "selectable",
          "hasControls",
          "locked",
        ];

        const canvasData = canvas.toObject(propertiesToInclude);

        console.log(canvasData, "canvasData");

        if (imageUrl) {
          await database.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
            process.env.NEXT_PUBLIC_APPWRITE_TEMPLATE_COLLECTION_ID as string,
            designId!,
            {
              template: JSON.stringify(canvasData),
              previewImageID: uploadedImage.$id,
              previewImage: imageUrl,
              name,
            }
          );
        }
      }
    } catch (error) {
      console.error("Error saving design", error);
      toast.error("Failed to save design");
    } finally {
      setIsLoading(false);
      toast.success("Design saved successfully");
    }
  };

  return (
    <header className="header-gradient  header flex items-center justify-between px-4 h-14">
      <div className="flex w-full justify-between items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <Button className="flex items-center " variant={"secondary"}>
              <span>{isEditing ? "Editing" : "Viewing"}</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editing</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditing(false)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Viewing</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex-1 flex justify-center max-w-md">
          <Input
            className="w-full bg-white text-neutral-900 border border-neutral-300 focus:ring-0 focus:border-neutral-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Button isLoading={isLoading} onClick={handleSave}>
            {" "}
            <SaveIcon /> Save
          </Button>
          <Button
            isLoading={isLoading}
            onClick={handleExport}
            className=" ml-3 relative bg-blue-500 text-white hover:bg-blue-600"
            variant={"secondary"}
          >
            <Download className="w-5 h-5" /> Export
          </Button>
        </div>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </header>
  );
}

export default Header;
