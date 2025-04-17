"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { database, ID } from "@/appwrite";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function CreateFrame() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name) {
      toast.error("Please enter a name for your frame");
      return;
    }

    setIsLoading(true);

    try {
      // Create new frame document
      const frame = await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID!,
        ID.unique(),
        {
          name,
          width,
          height,
          template: JSON.stringify({
            version: "5.3.0",
            objects: [],
            background: "#ffffff",
          }),
        }
      );

      toast.success("Frame created successfully!");
      setOpen(false);
      router.push(`/admin/frames/${frame.$id}`);
    } catch (error) {
      console.error("Error creating frame:", error);
      toast.error("Failed to create frame");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Frame
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Frame</DialogTitle>
          <DialogDescription>
            Enter details to create a new frame for your designs.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Frame Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter frame name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Frame"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
