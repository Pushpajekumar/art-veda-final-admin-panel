import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { database, ID, Query } from "@/appwrite";
import { toast } from "sonner";

interface Template {
  $id: string;
  name: string;
}

interface AssignDailyEventProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  selectedDate: Date | null;
}

const AssignDailyEvent = ({
  isDialogOpen,
  setIsDialogOpen,
  selectedDate,
}: AssignDailyEventProps) => {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    const fetchTemplateImages = async () => {
      try {
        const response = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID as string,
          [Query.select(["name", "$id"])]
        );

        setTemplates(response.documents as unknown as Template[]);
        // Do something with the response if needed
        console.log(response, "Template Images 🟢");
      } catch (error) {
        console.error("Failed to fetch template images:", error);
      }
    };

    fetchTemplateImages();
  }, [isDialogOpen]);

  const handleAssignTemplate = async () => {
    setIsLoading(true);
    if (!selectedDate || !selectedTemplate) return;
    try {
      // Create a new Date object with the year, month, and day to avoid timezone issues
      const dateToStore = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          12,
          0,
          0 // Set to noon UTC to avoid any day shifting
        )
      );

      const existingDocument = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
        process.env.NEXT_PUBLIC_APPWRITE_DAILY_EVENT_ID as string,
        [Query.equal("date", dateToStore.toISOString())]
      );

      console.log(existingDocument, "Existing Document");

      if (existingDocument.total > 0) {
        console.log("Updating existing document");

        const existingTemplates = existingDocument.documents[0].template || [];
        //TODO: Check if the template already exists in the array
        // Only add the new template if it's not already in the array
        if (!existingTemplates.includes(selectedTemplate)) {
          await database.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
            process.env.NEXT_PUBLIC_APPWRITE_DAILY_EVENT_ID as string,
            existingDocument.documents[0].$id,
            {
              date: dateToStore.toISOString(),
              posts: [...existingTemplates, selectedTemplate], // Append new template to existing ones
            }
          );
        } else {
          toast.info("This template is already assigned to this date");
          setIsDialogOpen(false);
          setIsLoading(false);
          return;
        }
      } else {
        await database.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_DAILY_EVENT_ID as string,
          ID.unique(),
          {
            date: dateToStore.toISOString(),
            posts: [selectedTemplate],
          }
        );
      }
      setIsDialogOpen(false);
      toast.success("Template assigned successfully");
    } catch (error) {
      console.error("Error assigning template:", error);
      toast.error("Failed to assign template");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Template to Date</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-primary/10 p-3 rounded-lg mb-4 flex items-center gap-3">
            <CalendarIcon className="text-primary h-5 w-5" />
            <p className="font-medium">
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="template" className="text-sm font-medium">
              Choose Template
            </Label>
            <Select
              value={selectedTemplate || undefined}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger id="template" className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.$id} value={template.$id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" />
                      {template.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignTemplate}
            disabled={isLoading || !selectedTemplate}
            className="gap-2"
          >
            {isLoading ? "Assigning..." : "Assign Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDailyEvent;
