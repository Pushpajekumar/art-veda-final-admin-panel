"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "@/store/editor-store";
import {
  ChevronDown,
  Download,
  Eye,
  Loader2,
  LogOut,
  Pencil,
  Save,
  SaveOff,
  Share,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

function Header() {
  const {
    isEditing,
    setIsEditing,
    name,
    setName,
    canvas,
    saveStatus,
    markAsModified,
    designId,
    userDesigns,
    userSubscription,
    setShowPremiumModal,
  } = useEditorStore();
  const [showExportModal, setShowExportModal] = useState(false);

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
    if (userDesigns?.length >= 5 && !userSubscription.isPremium) {
      toast.error("Please upgrade to premium!", {
        description: "You need to upgrade to premium to create more designs",
      });

      return;
    }
    setShowExportModal(true);
  };

  return (
    <header className="header-gradient header flex items-center justify-between px-4 h-14">
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
        <button
          className={
            "relative flex items-center justify-center p-1.5 rounded-md hover:bg-muted transition-colors"
          }
          title={saveStatus !== "Saving..." ? "Save" : saveStatus}
          disabled={saveStatus === "Saving..."}
        >
          {saveStatus === "Saving..." ? (
            <div className="relative flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
              <span className="sr-only">Saving...</span>
            </div>
          ) : (
            <Save
              className={cn("h-5 w-5", saveStatus === "Saved" && "text-white")}
            />
          )}

          {saveStatus === "Saving..." && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          )}
        </button>
        <button
          onClick={handleExport}
          className="header-button ml-3 relative"
          title="Export"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* //TODO: */}
      {/* <ExportModal isOpen={showExportModal} onClose={setShowExportModal} /> */}
    </header>
  );
}

export default Header;
