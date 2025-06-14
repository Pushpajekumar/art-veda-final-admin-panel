"use client";
import { useState, useEffect, useCallback } from "react";
import SendNotificationForm from "@/components/SendNotificationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bell, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { database, Query } from "@/appwrite";

export default function NotificationsPage() {
  const [userTokens, setUserTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID) {
        throw new Error("Users collection ID not configured");
      }

      // Fetch all users with push tokens
      const response = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        [
          Query.select(["pushToken", "expoPushToken", "fcmToken"]),
          Query.limit(1000), // Get up to 1000 users with tokens
        ]
      );

      const tokens = response.documents
        .map(
          (user: any) => user.pushToken || user.expoPushToken || user.fcmToken
        )
        .filter(Boolean);

      setUserTokens(tokens);

      if (tokens.length === 0) {
        setError(
          "No users with push tokens found. Make sure users have registered for push notifications."
        );
      }

      console.log(`Found ${tokens.length} user tokens from database`);
    } catch (error) {
      console.error("Error fetching user tokens:", error);
      setError(
        "Failed to fetch user tokens. Please check your database configuration."
      );
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserTokens();
  }, [fetchUserTokens]);

  const handleNotificationSuccess = useCallback(() => {
    toast.success("Notification sent successfully to all users!");
  }, []);

  const handleNotificationError = useCallback((error: Error) => {
    console.error("Notification error:", error);
    toast.error(`Failed to send notification: ${error.message}`);
  }, []);

  const handleRetry = useCallback(() => {
    fetchUserTokens();
  }, [fetchUserTokens]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error Loading Data
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Push Notifications</h1>
      </div>

      {/* User Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {userTokens.length}
              </p>
              <p className="text-sm text-gray-600">Users with Push Tokens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {userTokens.length}
              </p>
              <p className="text-sm text-gray-600">Reachable Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {userTokens.length > 0 ? "Ready" : "Not Ready"}
              </p>
              <p className="text-sm text-gray-600">Service Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Form */}
      {userTokens.length > 0 ? (
        <SendNotificationForm
          userTokens={userTokens}
          onSuccess={handleNotificationSuccess}
          onError={handleNotificationError}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>No users available to send notifications to.</p>
              <p className="text-sm mt-2">
                Users need to register for push notifications first.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
