"use client";
import { useState, useEffect } from "react";
import SendNotificationForm from "@/components/SendNotificationForm";
// Import your database client
// import { db } from '../utils/db';

export default function NotificationsPage() {
  const [userTokens, setUserTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserTokens() {
      try {
        setLoading(true);
        // Replace this with your actual database call
        // const users = await db.collection('users').get();
        // const tokens = users.docs.map(user => user.data().pushToken).filter(Boolean);

        // Dummy data for example
        const tokens = [
          "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
          "ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]",
        ];

        setUserTokens(tokens);
      } catch (error) {
        console.error("Error fetching user tokens:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserTokens();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Push Notifications</h1>

      {loading ? (
        <p>Loading user data...</p>
      ) : (
        <>
          <div className="mb-4">
            <p>Found {userTokens.length} users with push tokens</p>
          </div>

          <SendNotificationForm
            userTokens={userTokens}
            onSuccess={() => console.log("Notification sent successfully")}
            onError={(error: Error) =>
              console.error("Notification error:", error)
            }
          />
        </>
      )}
    </div>
  );
}
