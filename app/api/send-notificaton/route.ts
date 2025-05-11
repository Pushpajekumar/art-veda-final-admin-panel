import { NextRequest, NextResponse } from "next/server";
import { Expo } from "expo-server-sdk";
import { database, Query } from "@/appwrite";
// Update the import path to match your project structure

// Initialize the Expo SDK
const expo = new Expo();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      body: messageBody,
      data = {},
      sound = "default",
      channelId = "default",
    } = body;

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: "Notification title and body are required" },
        { status: 400 }
      );
    }

    console.log(title, messageBody, data, sound, channelId);

    //get user tokens from database
    const tokens = await database.listDocuments(
      "6815de2b0004b53475ec",
      "6815e0be001731ca8b1b",
      [Query.isNotNull("expoToken"), Query.select(["expoToken"])]
    );

    if (tokens.documents.length === 0) {
      return NextResponse.json({ error: "No tokens found" }, { status: 404 });
    }

    // Create the messages to send
    const messages = tokens.documents.map((doc) => {
      const pushToken = doc.expoToken;
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Invalid Expo push token: ${pushToken}`);
        return null;
      }
      return {
        to: pushToken,
        sound,
        title,
        body: messageBody,
        data,
        channelId, // For Android channel ID
      };
    });
    // Filter out invalid messages
    const validMessages = messages.filter((message) => message !== null);
    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid tokens found" },
        { status: 404 }
      );
    }
    // Send the messages
    const chunks = expo.chunkPushNotifications(validMessages);
    const tickets = [];
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending chunk:", error);
        return NextResponse.json(
          { error: "Failed to send notification" },
          { status: 500 }
        );
      }
    }
    // Log the results for debugging
    console.log("Sent notifications:", {
      totalSent: tickets.length,
      tokens: validMessages.map((message) => message.to),
      title,
      messageBody,
    });
    // Check for errors in the tickets
    const errorTickets = tickets.filter((ticket) => ticket.status === "error");
    if (errorTickets.length > 0) {
      console.error("Error sending notifications:", errorTickets);
      return NextResponse.json(
        { error: "Failed to send some notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notifications sent successfully",
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
