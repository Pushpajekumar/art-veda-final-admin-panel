import { database } from "@/appwrite";
import React from "react";
import { Query } from "appwrite";

const Dashboard = async () => {
  // Fetch users
  const users = await database.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID as string
  );

  // Fetch posts
  const posts = await database.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
    process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID as string
  );

  // Fetch frames
  const frames = await database.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
    process.env.NEXT_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID as string
  );

  // Get recent 5 users
  const recentUsers = await database.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID as string,
    [Query.orderDesc("$createdAt"), Query.limit(5)]
  );

  //Today Posts

  // Get today's date in the format "YYYY-MM-DD"
  const today = new Date().toISOString().split("T")[0];

  const todayPosts = await database.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
    process.env.NEXT_PUBLIC_APPWRITE_DAILY_EVENT_ID as string,
    [Query.equal("date", today + "T12:00:00.000+00:00")]
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500 text-sm">Total Users</h2>
          <p className="text-3xl font-bold">{users.total}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500 text-sm">Total Posts</h2>
          <p className="text-3xl font-bold">{posts.total}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500 text-sm">Total Frames</h2>
          <p className="text-3xl font-bold">{frames.total}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.documents.map((user) => (
                <tr key={user.$id} className="border-b">
                  <td className="py-2">{user.name}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">
                    {new Date(user.$createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Today's Events</h2>
          {todayPosts.documents.length > 0 ? (
            <div className="space-y-4">
              {todayPosts.documents.map((event) => (
                <div key={event.$id} className="mb-6">
                  <h3 className="text-lg font-medium mb-2">
                    Event: {event.name || "Unnamed Event"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.posts.map((post: any, index: number) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 bg-gray-50"
                      >
                        {post.previewImage && (
                          <div className="mb-2 h-40 overflow-hidden rounded">
                            <img
                              src={post.previewImage}
                              alt={post.name || "Post image"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="font-medium">
                            {post.name || "Unnamed Post"}
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>
                              Size: {post.width || "0"}x{post.height || "0"}
                            </p>
                            {post.subCategory && (
                              <p>Category: {post.subCategory.name || "N/A"}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No events scheduled for today</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
