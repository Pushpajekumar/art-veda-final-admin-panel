"use client";
import { useState, useEffect, useCallback } from "react";
import SendNotificationForm from "@/components/SendNotificationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bell, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { database } from "@/appwrite";

export default function NotificationsPage() {
  const [userTokens, setUserTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setTestTokens = useCallback(() => {
    // Test tokens for development - replace these with actual user tokens
    const tokens = [
      "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]", // Replace with actual tokens
      "ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]",
      "ExponentPushToken[zzzzzzzzzzzzzzzzzzzzzz]",
    ];
    setUserTokens(tokens);
    console.log("Using test tokens for development");
  }, []);

  const fetchUserTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from actual users collection
      try {
        if (!process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID) {
          console.log("Users collection ID not configured, using test tokens");
          setTestTokens();
          return;
        }

        const response = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!
        );

        const tokens = response.documents
          .map((user: any) => user.pushToken || user.expoPushToken)
          .filter(Boolean);

        if (tokens.length > 0) {
          setUserTokens(tokens);
          console.log(`Found ${tokens.length} user tokens from database`);
        } else {
          // If no tokens in database, use test tokens
          console.log("No user tokens found in database, using test tokens");
          setTestTokens();
        }
      } catch (dbError) {
        console.log("Database fetch failed, using test tokens:", dbError);
        setTestTokens();
      }
    } catch (error) {
      console.error("Error fetching user tokens:", error);
      setError("Failed to fetch user tokens. Please try again.");
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, [setTestTokens]);

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
              <p className="text-2xl font-bold text-blue-600">Ready</p>
              <p className="text-sm text-gray-600">Service Status</p>
            </div>
          </div>

          {/* Debug info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600">
              Debug: Using{" "}
              {userTokens.length === 3 ? "test tokens" : "database tokens"}
            </p>
            {userTokens.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                First token: {userTokens[0].slice(0, 30)}...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Form */}
      <SendNotificationForm
        userTokens={userTokens}
        onSuccess={handleNotificationSuccess}
        onError={handleNotificationError}
      />
    </div>
  );
}
