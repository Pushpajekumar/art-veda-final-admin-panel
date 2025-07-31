"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SendIcon, Users, Info } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  body: z.string().min(1, {
    message: "Body is required",
  }),
  channelId: z.string().optional(),
  sound: z.string().optional(),
  image: z.string().optional(),
});

interface SendNotificationFormProps {
  userTokens: string[];
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export default function SendNotificationForm({
  userTokens,
  onSuccess,
  onError,
}: SendNotificationFormProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      body: "",
      channelId: "default",
      sound: "default",
      image: "",
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      if (userTokens.length === 0) {
        toast.error("No users available to send notifications to");
        return;
      }

      setLoading(true);
      setStatus({ type: null, message: "" });

      try {
        const response = await fetch("/api/send-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: data.title,
            body: data.body,
            channelId: data.channelId || "default",
            sound: data.sound || "default",
            image: data.image || "",
            userTokens,
          }),
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        let result;

        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const textResponse = await response.text();
          console.error("Non-JSON response:", textResponse);
          throw new Error(
            "Server returned an invalid response. Please check if the API endpoint exists."
          );
        }

        console.log("Notification API response:", result);

        if (!response.ok) {
          throw new Error(result.error || `Server error: ${response.status}`);
        }

        // Enhanced response handling with better error detection
        const {
          sentTo = 0,
          failed = 0,
          total = 0,
          success = false,
          processingStats,
        } = result;

        // Check for processing issues
        if (processingStats?.resultsMismatch) {
          console.warn("Results mismatch detected:", processingStats);
        }

        // Reset form after successful submission
        form.reset();

        // More nuanced success/error messaging
        if (success && sentTo > 0) {
          if (failed > 0) {
            const failureRate = Math.round((failed / total) * 100);
            const message = `Notification sent to ${sentTo} users (${failed} failed - ${failureRate}% failure rate)`;

            setStatus({
              type: failureRate > 50 ? "error" : "success",
              message,
            });

            if (failureRate > 50) {
              onError(
                new Error(
                  `High failure rate: ${failed}/${total} notifications failed. Check token validity.`
                )
              );
            } else {
              onSuccess();
              toast.success(
                `Notification sent to ${sentTo} users with ${failed} failures`
              );
            }
          } else {
            setStatus({
              type: "success",
              message: `Notification sent successfully to all ${sentTo} users!`,
            });
            onSuccess();
            toast.success(
              `Notification sent successfully to all ${sentTo} users!`
            );
          }
        } else if (sentTo === 0 && total > 0) {
          // All notifications failed
          setStatus({
            type: "error",
            message: `All ${total} notifications failed to send. Please check token validity.`,
          });
          onError(
            new Error(
              `All notifications failed: ${
                result.errorBreakdown
                  ? JSON.stringify(result.errorBreakdown)
                  : "Unknown reasons"
              }`
            )
          );
        } else if (sentTo === 0 && total === 0) {
          // No notifications were processed
          setStatus({
            type: "error",
            message:
              "No notifications were processed. Please check your configuration.",
          });
          onError(new Error("No notifications were processed"));
        } else {
          // Unexpected state
          console.warn("Unexpected notification result state:", result);
          setStatus({
            type: "error",
            message: "Unexpected response from notification service.",
          });
          onError(new Error("Unexpected notification service response"));
        }

        // Log additional debug info
        if (
          result.errorBreakdown &&
          Object.keys(result.errorBreakdown).length > 0
        ) {
          console.log("Error breakdown:", result.errorBreakdown);
        }
      } catch (error) {
        console.error("Error sending notification:", error);
        let errorMessage = "Failed to send notification";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setStatus({
          type: "error",
          message: errorMessage,
        });
        onError(error instanceof Error ? error : new Error(errorMessage));
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [userTokens, onSuccess, onError, form]
  );

  // Auto-clear status messages after 5 seconds
  useState(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  });

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="space-y-1 bg-muted/50">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <SendIcon className="h-6 w-6" />
          Send Notification
        </CardTitle>
        <CardDescription className="text-center">
          Configure and send a new notification to your users
        </CardDescription>

        {/* User count indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {userTokens.length} users will receive this notification
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Status Messages */}
        {status.type && (
          <div
            className={`mb-4 p-4 rounded-md flex items-start gap-2 ${
              status.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{status.message}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter notification title"
                        {...field}
                        className="transition-all focus-visible:ring-offset-2"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      The main title that will appear in the notification.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Body</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter notification message"
                        {...field}
                        className="min-h-24 transition-all focus-visible:ring-offset-2"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      The main content of your notification.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter image URL"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        className="transition-all focus-visible:ring-offset-2"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      The URL of the image to be included in the notification.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <CardFooter className="px-0 pb-0">
              <Button
                type="submit"
                disabled={loading || userTokens.length === 0}
                className="w-full transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending to {userTokens.length} users...
                  </div>
                ) : (
                  <>
                    <SendIcon className="w-4 h-4 mr-2" />
                    Send Notification ({userTokens.length} users)
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
