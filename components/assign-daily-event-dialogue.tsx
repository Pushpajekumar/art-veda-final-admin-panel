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
import { CalendarIcon, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { database, ID, Query } from "@/appwrite";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Template {
  $id: string;
  name: string;
}

interface AssignDailyEventProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  selectedDate: Date | null;
}

const TEMPLATES_PER_PAGE = 25;

const AssignDailyEvent = ({
  isDialogOpen,
  setIsDialogOpen,
  selectedDate,
}: AssignDailyEventProps) => {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [allTemplates, setAllTemplates] = React.useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalTemplates, setTotalTemplates] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);

  const fetchTemplates = async (page: number = 1, search: string = "") => {
    try {
      setIsLoadingTemplates(true);
      const offset = (page - 1) * TEMPLATES_PER_PAGE;

      const queries = [
        Query.select(["name", "$id"]),
        Query.limit(TEMPLATES_PER_PAGE),
        Query.offset(offset),
        Query.orderDesc("$createdAt"),
      ];

      // Add search query if provided
      if (search.trim()) {
        queries.push(Query.search("name", search));
      }

      const response = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
        process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID as string,
        queries
      );

      const fetchedTemplates = response.documents as unknown as Template[];

      if (page === 1) {
        setTemplates(fetchedTemplates);
        setAllTemplates(fetchedTemplates);
      } else {
        setTemplates((prev) => [...prev, ...fetchedTemplates]);
        setAllTemplates((prev) => [...prev, ...fetchedTemplates]);
      }

      setTotalTemplates(response.total);
      setTotalPages(Math.ceil(response.total / TEMPLATES_PER_PAGE));

      console.log(
        `Fetched ${fetchedTemplates.length} templates (Page ${page})`
      );
    } catch (error) {
      console.error("Failed to fetch template images:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      setCurrentPage(1);
      setSearchQuery("");
      setTemplates([]);
      setAllTemplates([]);
      fetchTemplates(1);
    }
  }, [isDialogOpen]);

  const handleSearch = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      setTemplates([]);
      setAllTemplates([]);
      fetchTemplates(1, query);
    },
    [fetchTemplates]
  );

  const loadMoreTemplates = () => {
    if (currentPage < totalPages && !isLoadingTemplates) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchTemplates(nextPage, searchQuery);
    }
  };

  const getSelectedTemplateName = () => {
    const template = allTemplates.find((t) => t.$id === selectedTemplate);
    return template ? template.name : "Select a template";
  };

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

        const existingPosts = existingDocument.documents[0].posts || [];
        // Check if the template already exists in the array
        if (!existingPosts.includes(selectedTemplate)) {
          await database.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
            process.env.NEXT_PUBLIC_APPWRITE_DAILY_EVENT_ID as string,
            existingDocument.documents[0].$id,
            {
              date: dateToStore.toISOString(),
              posts: [...existingPosts, selectedTemplate], // Append new template to existing ones
            }
          );
          toast.success("Template assigned successfully");
        } else {
          toast.info("This template is already assigned to this date");
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
        toast.success("Template assigned successfully");
      }
      setIsDialogOpen(false);
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

            {/* Custom Select with Pagination */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{getSelectedTemplateName()}</span>
                <ChevronLeft
                  className={`h-4 w-4 transition-transform ${
                    isSelectOpen ? "rotate-90" : "-rotate-90"
                  }`}
                />
              </button>

              {isSelectOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>

                  {/* Templates List */}
                  <div className="max-h-60 overflow-y-auto">
                    {templates.length === 0 && !isLoadingTemplates ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        {searchQuery
                          ? "No templates found"
                          : "No templates available"}
                      </div>
                    ) : (
                      <>
                        {templates.map((template) => (
                          <div
                            key={template.$id}
                            onClick={() => {
                              setSelectedTemplate(template.$id);
                              setIsSelectOpen(false);
                            }}
                            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                              selectedTemplate === template.$id
                                ? "bg-accent text-accent-foreground"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-primary/20" />
                              {template.name}
                            </div>
                            {selectedTemplate === template.$id && (
                              <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                                ✓
                              </span>
                            )}
                          </div>
                        ))}

                        {/* Load More Button */}
                        {currentPage < totalPages && (
                          <div className="p-2 border-t">
                            <button
                              onClick={loadMoreTemplates}
                              disabled={isLoadingTemplates}
                              className="w-full py-2 px-3 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoadingTemplates ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                  Loading...
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <ChevronRight className="h-4 w-4" />
                                  Load More ({totalTemplates -
                                    templates.length}{" "}
                                  remaining)
                                </div>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Pagination Info */}
                        <div className="p-2 border-t text-xs text-muted-foreground text-center">
                          Showing {templates.length} of {totalTemplates}{" "}
                          templates
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
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
