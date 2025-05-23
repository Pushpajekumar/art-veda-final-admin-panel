"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SendIcon } from "lucide-react";

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
import { useState } from "react";

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

export default function SendNotificationForm({
  userTokens,
  onSuccess,
  onError,
}: {
  userTokens: string[];
  onSuccess: () => void;
  onError: (error: Error) => void;
}) {
  const [loading, setLoading] = useState(false);

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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    try {
      const response = await fetch("/api/send-notificaton", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          body: data.body,
          channelId: data.channelId,
          sound: data.sound,
          data: data.data ? JSON.parse(data.data) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      // Reset form after successful submission
      form.reset();
      alert("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send notification. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="space-y-1 bg-muted/50">
        <CardTitle className="text-2xl font-bold text-center">
          Send Notification
        </CardTitle>
        <CardDescription className="text-center">
          Configure and send a new notification to your users
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
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
                className="w-full transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <SendIcon className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
