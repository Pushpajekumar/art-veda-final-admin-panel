"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Frame } from "lucide-react";
import { User } from "./columns";
import { database, Query } from "@/appwrite";
import { toast } from "sonner";

interface ViewUserDialogProps {
  user: User;
}

export function AssignFramesToUser({ user }: ViewUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [frames, setFrames] = useState<any[]>([]);
  const [loadingFrameId, setLoadingFrameId] = useState<string | null>(null);
  const [loadingFrames, setLoadingFrames] = useState(false);

  // Fetch frames only when dialog is open
  useEffect(() => {
    if (!open) return;

    const fetchFrames = async () => {
      try {
        setLoadingFrames(true);
        const res = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID as string,
          [Query.orderDesc("$createdAt")]
        );
        setFrames(res.documents);
      } catch (error) {
        toast.error("Failed to fetch frames.");
        console.error("Error fetching frames:", error);
      } finally {
        setLoadingFrames(false);
      }
    };

    fetchFrames();
  }, [open]);

  // Reset frames when dialog closes
  useEffect(() => {
    if (!open) {
      setFrames([]);
      setLoadingFrames(false);
    }
  }, [open]);

  // Memoize user's assigned frames
  const usersFrames = useMemo(
    () =>
      frames.filter(
        (frame) =>
          Array.isArray(frame.users) &&
          frame.users.some((u: { $id: string }) => u.$id === user.id)
      ),
    [frames, user.id]
  );

  // Memoize unassigned frames
  const unassignedFrames = useMemo(
    () =>
      frames.filter(
        (frame) =>
          !Array.isArray(frame.users) ||
          !frame.users.some((u: { $id: string }) => u.$id === user.id)
      ),
    [frames, user.id]
  );

  // Assign frame to user
  const handleAssign = useCallback(
    async (frameId: string) => {
      setLoadingFrameId(frameId);
      try {
        const frame = frames.find((f) => f.$id === frameId);
        const updatedUsers = Array.isArray(frame?.users)
          ? [...frame.users, { $id: user.id }]
          : [{ $id: user.id }];
        await database.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID as string,
          frameId,
          { users: updatedUsers }
        );
        toast.success(`Frame assigned to ${user.name} successfully!`);
        setOpen(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        toast.error(`Failed to assign frame: ${errorMessage}`);
      } finally {
        setLoadingFrameId(null);
      }
    },
    [frames, user.id, user.name]
  );

  // Remove frame from user
  const handleRemove = useCallback(
    async (frameId: string) => {
      setLoadingFrameId(frameId);
      try {
        const frame = frames.find((f) => f.$id === frameId);
        const updatedUsers = (frame?.users || []).filter(
          (u: { $id: string }) => u.$id !== user.id
        );
        await database.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID as string,
          frameId,
          { users: updatedUsers }
        );
        toast.success(`Frame removed from ${user.name} successfully!`);
        setOpen(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        toast.error(`Failed to remove frame: ${errorMessage}`);
      } finally {
        setLoadingFrameId(null);
      }
    },
    [frames, user.id, user.name]
  );

  // Remove all frames from user
  const handleRemoveAll = useCallback(async () => {
    setLoadingFrameId("all");
    try {
      await Promise.all(
        usersFrames.map((frame) =>
          database.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
            process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID as string,
            frame.$id,
            {
              users: (frame.users || []).filter(
                (u: { $id: string }) => u.$id !== user.id
              ),
            }
          )
        )
      );
      toast.success(`All frames removed from ${user.name} successfully!`);
      setOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Failed to remove all frames: ${errorMessage}`);
    } finally {
      setLoadingFrameId(null);
    }
  }, [usersFrames, user.id, user.name]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-800"
        >
          <Frame className="h-4 w-4 mr-1" />
          Assign Frame
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Frame className="h-5 w-5" />
            Assign Frame
          </DialogTitle>
          <DialogDescription>
            Assign frames to the user{" "}
            <span className="font-semibold">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Loading State */}
          {loadingFrames ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-gray-500">Loading frames...</p>
            </div>
          ) : (
            <>
              {/* Users Assigned Frames */}
              {usersFrames.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Assigned Frames</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveAll}
                      disabled={loadingFrameId === "all"}
                    >
                      {loadingFrameId === "all" ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          Removing...
                        </>
                      ) : (
                        "Remove All"
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {usersFrames.map((frame) => (
                      <div
                        key={frame.$id}
                        className="relative flex flex-col items-center"
                      >
                        <button
                          className="absolute top-0 right-0 bg-white rounded-full p-1 shadow hover:bg-red-100 transition disabled:opacity-50"
                          style={{ transform: "translate(40%, -40%)" }}
                          onClick={() => handleRemove(frame.$id)}
                          disabled={loadingFrameId === frame.$id}
                          title="Remove frame"
                          type="button"
                        >
                          {loadingFrameId === frame.$id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                          ) : (
                            <span className="text-red-500 text-lg font-bold leading-none">
                              &times;
                            </span>
                          )}
                        </button>
                        <img
                          src={frame.previewImage}
                          alt={frame.name}
                          className="w-16 h-16 object-cover rounded-md border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-frame.png";
                          }}
                        />
                        <span className="text-xs mt-1 text-center max-w-[64px] truncate" title={frame.name}>
                          {frame.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Frame className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No frames assigned to this user.</p>
                </div>
              )}

              {/* Available Frames to Assign */}
              <div>
                <h4 className="font-semibold mb-3">Available Frames</h4>
                {unassignedFrames.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {unassignedFrames.map((frame) => (
                      <div
                        key={frame.$id}
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={frame.previewImage}
                            alt={frame.name}
                            className="w-10 h-10 object-cover rounded-md border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-frame.png";
                            }}
                          />
                          <span className="font-medium truncate max-w-[150px]" title={frame.name}>
                            {frame.name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssign(frame.$id)}
                          disabled={loadingFrameId === frame.$id}
                        >
                          {loadingFrameId === frame.$id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Assigning...
                            </>
                          ) : (
                            "Assign"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Frame className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      {frames.length === 0
                        ? "No frames available in the system."
                        : "All available frames are already assigned to this user."
                      }
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
