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
  data: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = JSON.parse(val);
          return typeof parsed === "object";
        } catch {
          return false;
        }
      },
      {
        message: "Data must be valid JSON",
      }
    ),
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
      data: "",
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
        // Prepare data payload
        let parsedData = undefined;
        if (data.data && data.data.trim()) {
          try {
            parsedData = JSON.parse(data.data);
          } catch (jsonError) {
            toast.error("Invalid JSON format in data field");
            setLoading(false);
            return;
          }
        }

        console.log("Sending notification with data:", {
          title: data.title,
          body: data.body,
          userCount: userTokens.length,
          hasData: !!parsedData,
        });

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
            data: parsedData,
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

        // Reset form after successful submission
        form.reset();

        const successMessage =
          result.failed > 0
            ? `Notification sent to ${result.sentTo} users (${result.failed} failed)`
            : `Notification sent successfully to ${result.sentTo} users!`;

        setStatus({
          type: result.failed > 0 ? "error" : "success",
          message: successMessage,
        });

        if (result.failed === 0) {
          onSuccess();
        } else {
          onError(new Error(`${result.failed} notifications failed to send`));
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
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"key": "value"}'
                        className="min-h-32 font-mono text-sm resize-y transition-all focus-visible:ring-offset-2"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Additional data in valid JSON format to be sent with the
                      notification.
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
