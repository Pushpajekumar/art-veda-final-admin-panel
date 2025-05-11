interface SendNotificationParams {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: string;
}

export async function sendPushNotification({
  tokens,
  title,
  body,
  data = {},
  channelId = "default",
}: SendNotificationParams) {
  try {
    const response = await fetch("/api/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add auth headers if needed
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        tokens,
        title,
        body,
        data,
        channelId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to send notification");
    }

    return result;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}
