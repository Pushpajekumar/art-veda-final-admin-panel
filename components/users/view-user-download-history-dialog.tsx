"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Mail,
  Phone,
  Calendar,
  Crown,
  User as UserIcon,
  MapPin,
  Briefcase,
  Users,
  Clipboard,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { formatDate } from "./data-table";
import { User } from "./columns";
import { database, Query } from "@/appwrite";
import { Models } from "appwrite";
import Image from "next/image";

interface ViewUserDialogProps {
  user: User;
}

interface DownloadedPost {
  id: string;
  name: string;
  previewImage: string;
  downloadedAt: string;
  category?: string;
}

export function ViewUserDownloadHistory({ user }: ViewUserDialogProps) {
  const [downloadHistory, setDownloadHistory] = useState<Models.Document[]>([]);
  const [downloadedPosts, setDownloadedPosts] = useState<DownloadedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchingDownloadHistory = async () => {
      if (!open) return;

      try {
        setLoading(true);
        const downloadHistory = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_ARTIST_COLLECTION_ID as string,
          [
            Query.equal("userId", user.id),
            Query.orderDesc("$createdAt"),
            Query.limit(20), // Limit to last 20 downloads
          ]
        );

        setDownloadHistory(downloadHistory.documents);

        // Extract posts with preview images
        const posts: DownloadedPost[] = [];
        console.log(downloadHistory.documents, "Download History 🟡");

        downloadHistory.documents.forEach((download) => {
          if (download.posts && Array.isArray(download.posts)) {
            console.log(download.posts, "Download Posts 🔴");
            download.posts.forEach((post: any) => {
              if (post.previewImage) {
                posts.push({
                  id: post.$id,
                  name: post.name || "Untitled",
                  previewImage: post.previewImage,
                  downloadedAt: download.$createdAt,
                  category: post.subCategory?.name || "Unknown Category",
                });
              }
            });
          }
        });

        // Remove duplicates based on post ID and sort by download date
        const uniquePosts = posts
          .filter(
            (post, index, self) =>
              index === self.findIndex((p) => p.id === post.id)
          )
          .sort(
            (a, b) =>
              new Date(b.downloadedAt).getTime() -
              new Date(a.downloadedAt).getTime()
          );

        setDownloadedPosts(uniquePosts);
      } catch (error) {
        console.error("Error fetching download history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchingDownloadHistory();
  }, [user, open]);

  console.log(downloadedPosts, "🟢");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-violet-600 hover:text-violet-800"
        >
          <Clipboard className="h-4 w-4 mr-1" />
          Download History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download History - {user.name}
          </DialogTitle>
          <DialogDescription>
            Templates downloaded by this user ({downloadedPosts.length} unique
            templates)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Summary */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.isPremium ? "default" : "secondary"}>
                  {user.isPremium ? "Premium" : "Free"}
                </Badge>
                {/* <span className="text-xs text-gray-500">
                  {downloadHistory.length} downloads
                </span> */}
              </div>
            </div>
          </div>

          {/* Download Statistics */}
          {/* <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {downloadHistory.length}
              </div>
              <div className="text-xs text-blue-600">Total Downloads</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {downloadedPosts.length}
              </div>
              <div className="text-xs text-green-600">Unique Templates</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(downloadedPosts.map((p) => p.category)).size}
              </div>
              <div className="text-xs text-purple-600">Categories</div>
            </div>
          </div> */}

          {/* Downloaded Templates Gallery */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Downloaded Templates
            </h4>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
              </div>
            ) : downloadedPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No templates downloaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {downloadedPosts.map((post, index) => (
                  <div
                    key={`${post.id}-${index}`}
                    className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square relative bg-gray-100">
                      <Image
                        src={post.previewImage}
                        alt={post.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>

                    <div className="p-3">
                      <h5
                        className="font-medium text-sm text-gray-900 truncate"
                        title={post.name}
                      >
                        {post.name}
                      </h5>
                      <p
                        className="text-xs text-gray-500 truncate"
                        title={post.category}
                      >
                        {post.category}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(post.downloadedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Download History List */}
          {/* {downloadHistory.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent Activity
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {downloadHistory.slice(0, 10).map((download, index) => (
                  <div
                    key={download.$id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                  >
                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                      <Download className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Downloaded {download.posts?.length || 0} template(s)
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(download.$createdAt)}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">#{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* User ID */}
          {/* <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">User ID: {user.id}</p>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
