import { NextResponse } from "next/server";

interface NotificationPayload {
  to: string;
  sound: string;
  title: string;
  body: string;
  data?: any;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: content, channelId, sound, data, userTokens } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    if (!userTokens || !Array.isArray(userTokens) || userTokens.length === 0) {
      return NextResponse.json(
        { error: "No user tokens provided" },
        { status: 400 }
      );
    }

    // Prepare notification messages
    const messages: NotificationPayload[] = userTokens.map((token: string) => ({
      to: token,
      sound: sound || "default",
      title,
      body: content,
      data: {
        channelId: channelId || "default",
        ...data,
      },
    }));

    console.log("Preparing to send notifications:", {
      title,
      content,
      userCount: userTokens.length,
      messages: messages.slice(0, 2), // Log first 2 messages for debugging
    });

    // Send notifications using Expo Push Notification service
    const results = [];
    for (const message of messages) {
      try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });

        const result = await response.json();
        results.push(result);

        if (!response.ok) {
          console.error(
            "Failed to send notification to token:",
            message.to,
            result
          );
        }
      } catch (error) {
        console.error(
          "Error sending notification to token:",
          message.to,
          error
        );
        results.push({ error: "Failed to send" });
      }
    }

    // Count successful sends
    const successCount = results.filter(
      (result) => result.data && result.data.status === "ok"
    ).length;
    const errorCount = results.length - successCount;

    console.log("Notification results:", {
      total: results.length,
      successful: successCount,
      failed: errorCount,
    });

    return NextResponse.json({
      success: true,
      message: `Notifications processed. ${successCount} sent successfully, ${errorCount} failed.`,
      sentTo: successCount,
      failed: errorCount,
      total: results.length,
    });
  } catch (error) {
    console.error("Error in notification API:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
