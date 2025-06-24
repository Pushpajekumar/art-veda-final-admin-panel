import { NextResponse } from "next/server";

interface NotificationPayload {
  to: string;
  sound: string;
  title: string;
  body: string;
  data?: any;
}

// Function to validate Expo push token format
function isValidExpoPushToken(token: string): boolean {
  return (
    /^ExponentPushToken\[[a-zA-Z0-9_-]+\]$/.test(token) ||
    /^ExpoPushToken\[[a-zA-Z0-9_-]+\]$/.test(token)
  );
}

// Function to chunk tokens for batch processing
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
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

    // Filter and validate tokens
    const validTokens = userTokens.filter((token: string) => {
      if (!token || typeof token !== "string") {
        console.log("Invalid token type:", typeof token, token);
        return false;
      }

      if (!isValidExpoPushToken(token)) {
        console.log("Invalid token format:", token);
        return false;
      }

      return true;
    });

    console.log(
      `Filtered ${validTokens.length} valid tokens from ${userTokens.length} total tokens`
    );

    if (validTokens.length === 0) {
      return NextResponse.json(
        { error: "No valid push tokens found" },
        { status: 400 }
      );
    }

    // Prepare notification messages
    const messages: NotificationPayload[] = validTokens.map(
      (token: string) => ({
        to: token,
        sound: sound || "default",
        title,
        body: content,
        data: {
          channelId: channelId || "default",
          ...data,
        },
      })
    );

    console.log("Preparing to send notifications:", {
      title,
      content,
      validTokenCount: validTokens.length,
      totalTokenCount: userTokens.length,
      sampleMessage: messages[0],
    });

    // Send notifications in batches using Expo's batch API
    const chunks = chunkArray(messages, 100); // Expo recommends max 100 notifications per request
    const allResults = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(
        `Sending batch ${i + 1}/${chunks.length} with ${
          chunk.length
        } notifications`
      );

      try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chunk),
        });

        const responseText = await response.text();
        console.log(`Batch ${i + 1} response status:`, response.status);
        console.log(`Batch ${i + 1} response:`, responseText);

        if (!response.ok) {
          console.error(
            `Batch ${i + 1} failed with status ${response.status}:`,
            responseText
          );
          // Add error results for this batch
          chunk.forEach(() => {
            allResults.push({
              status: "error",
              message: `HTTP ${response.status}`,
            });
          });
          continue;
        }

        let batchResults;
        try {
          batchResults = JSON.parse(responseText);
        } catch (parseError) {
          console.error(`Failed to parse batch ${i + 1} response:`, parseError);
          chunk.forEach(() => {
            allResults.push({
              status: "error",
              message: "Invalid response format",
            });
          });
          continue;
        }

        // Handle Expo's response format correctly
        if (batchResults.data && Array.isArray(batchResults.data)) {
          // Expo returns {data: [{status: 'ok', id: '...'}, ...]}
          console.log(
            `Batch ${i + 1} parsed successfully:`,
            batchResults.data.length,
            "results"
          );
          allResults.push(...batchResults.data);
        } else if (Array.isArray(batchResults)) {
          // Direct array response
          allResults.push(...batchResults);
        } else if (batchResults.status) {
          // Single notification response
          allResults.push(batchResults);
        } else {
          console.error(
            `Unexpected batch ${i + 1} response format:`,
            batchResults
          );
          chunk.forEach(() => {
            allResults.push({
              status: "error",
              message: "Unexpected response format",
            });
          });
        }
      } catch (error) {
        console.error(`Error sending batch ${i + 1}:`, error);
        // Add error results for this batch
        chunk.forEach(() => {
          allResults.push({ status: "error", message: "Network error" });
        });
      }

      // Add small delay between batches to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(
      `Total results received: ${allResults.length}, Expected: ${validTokens.length}`
    );

    // Analyze results with better error handling
    const successCount = allResults.filter(
      (result) => result && result.status === "ok"
    ).length;

    const errorCount = allResults.length - successCount;

    // Log detailed error analysis
    const errorDetails = allResults
      .filter((result) => !result || result.status !== "ok")
      .reduce((acc: any, result) => {
        const errorType =
          result?.details?.error ||
          result?.message ||
          result?.status ||
          "unknown_error";
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      }, {});

    console.log("Notification results analysis:", {
      total: allResults.length,
      successful: successCount,
      failed: errorCount,
      errorBreakdown: errorDetails,
      validTokensProcessed: validTokens.length,
      resultsReceived: allResults.length,
    });

    // Log some example errors for debugging
    const errorExamples = allResults
      .filter((result) => !result || result.status !== "ok")
      .slice(0, 5)
      .map((result) => ({
        status: result?.status || "undefined",
        message: result?.message || "undefined",
        details: result?.details || "undefined",
        fullResult: result,
      }));

    if (errorExamples.length > 0) {
      console.log("Example errors:", errorExamples);
    }

    // Determine success/failure more accurately
    const isSuccess = successCount > 0;
    const hasPartialFailure = errorCount > 0;

    return NextResponse.json({
      success: isSuccess,
      message: `Notifications processed. ${successCount} sent successfully${
        hasPartialFailure ? `, ${errorCount} failed` : ""
      }.`,
      sentTo: successCount,
      failed: errorCount,
      total: allResults.length,
      validTokens: validTokens.length,
      invalidTokens: userTokens.length - validTokens.length,
      errorBreakdown: errorDetails,
      processingStats: {
        expectedResults: validTokens.length,
        actualResults: allResults.length,
        resultsMismatch: allResults.length !== validTokens.length,
      },
    });
  } catch (error) {
    console.error("Error in notification API:", error);
    return NextResponse.json(
      {
        error: "Failed to send notification",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}
