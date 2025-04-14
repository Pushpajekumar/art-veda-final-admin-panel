"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from "@/store/editor-store";
import {
  ChevronDown,
  Download,
  Eye,
  Loader2,
  Pencil,
  Save,
  SaveIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ExportModal from "./export-modal";
import { database, ID, storage } from "@/appwrite";
import { Button } from "../ui/button";

function Header() {
  const { isEditing, setIsEditing, name, canvas, markAsModified, designId } =
    useEditorStore();
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

        const canvasData = canvas.toObject(["id", "filters"]);

        if (imageUrl) {
          await database.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
            process.env.NEXT_PUBLIC_APPWRITE_TEMPLATE_COLLECTION_ID as string,
            designId!,
            {
              template: JSON.stringify(canvasData),
              previewImageID: uploadedImage.$id,
              previewImage: imageUrl,
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
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <button className="header-button flex items-center text-white">
              <span>{isEditing ? "Editing" : "Viewing"}</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
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
        <Button isLoading={isLoading} onClick={handleSave}>
          {" "}
          <SaveIcon /> Save
        </Button>
        <button
          onClick={handleExport}
          className="header-button ml-3 relative"
          title="Export"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </header>
  );
}

export default Header;
