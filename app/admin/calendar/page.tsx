"use client";
import { useState, useEffect, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isBefore,
  startOfDay,
  isSameDay,
} from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Calendar as CalendarLucide, X } from "lucide-react";
import AssignDailyEvent from "@/components/assign-daily-event-dialogue";
import { database, Query } from "@/appwrite";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";

// Set up calendar localizer
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [formattedEvents, setFormattedEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<any[]>([]);
  const [showEventsDialog, setShowEventsDialog] = useState(false);

  // Today's date at the beginning of the day
  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const events = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_DAILY_EVENT_ID!,
          [
            Query.greaterThanEqual(
              "date",
              new Date().toISOString().split("T")[0]
            ),
          ]
        );
        setEvents(events.documents);

        // Format events for the calendar
        const calendarEvents = events.documents.map((event: any) => {
          // Get first posts for preview image
          const posts =
            event.posts && event.posts.length > 0
              ? event.posts[0]
              : null;

          const eventDate = new Date(event.date);

          return {
            id: event.$id,
            title: posts?.name || "posts Event",
            start: eventDate,
            end: eventDate,
            allDay: true,
            resource: event,
            color: "#3b82f6", // Blue color for events
          };
        });

        setFormattedEvents(calendarEvents);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        toast.error("Failed to load posts events");
      }
    };

    fetchDocuments();
  }, []);

  // Check if a date has an event
  const hasEventOnDate = (date: Date) => {
    return formattedEvents.some(
      (event) => event.start && isSameDay(new Date(event.start), date)
    );
  };

  // Custom styles for calendar components
  const calendarStyles = {
    event: (event: any) => ({
      style: {
        backgroundColor: event.color || "#3182ce",
        borderRadius: "4px",
        opacity: 0.8,
        border: "none",
        color: "white",
        padding: "2px 5px",
        fontWeight: 500,
      },
    }),
    dayWrapper: (date: Date) => {
      // Style for dates with events
      const hasEvent = hasEventOnDate(date);

      // Style for past dates
      const isPastDate = isBefore(date, today);

      return {
        style: {
          backgroundColor: isPastDate
            ? "#f3f4f6"
            : hasEvent
            ? "#dbeafe" // Light blue background for dates with events
            : "transparent",
          cursor: isPastDate ? "not-allowed" : "pointer",
        },
      };
    },
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    // Disable selecting past dates
    if (isBefore(start, today)) {
      toast.error("Cannot assign postss to past dates");
      return;
    }

    // Check if this date has events
    const dateEvents = events.filter((event) =>
      isSameDay(new Date(event.date), start)
    );

    if (dateEvents.length > 0) {
      // If the date has events, show them
      setSelectedDate(start);
      setSelectedDateEvents(dateEvents);
      setShowEventsDialog(true);
    } else {
      // Otherwise, open the dialog to create a new event
      setSelectedDate(start);
      setIsDialogOpen(true);
    }
  };

  const handleNavigateToday = () => {
    const calendarApi = document.querySelector(".rbc-calendar") as any;
    if (calendarApi && calendarApi.navigate) {
      calendarApi.navigate("TODAY");
    }
  };

  // Function to handle adding a new event after assignment
  const handleEventAssigned = (newEvent: any) => {
    // Add the new event to the formatted events
    setFormattedEvents((prev) => [
      ...prev,
      {
        id: newEvent.$id,
        title: newEvent.posts?.[0]?.name || "posts Event",
        start: new Date(newEvent.date),
        end: new Date(newEvent.date),
        allDay: true,
        resource: newEvent,
        color: "#3b82f6",
      },
    ]);

    // Update the raw events list as well
    setEvents((prev) => [...prev, newEvent]);
  };

  // Add a new function to handle clicking on a specific event
  const handleSelectEvent = (event: any) => {
    const eventDate = new Date(event.start);
    const dateEvents = events.filter((evt) =>
      isSameDay(new Date(evt.date), eventDate)
    );

    setSelectedDate(eventDate);
    setSelectedDateEvents(dateEvents);
    setShowEventsDialog(true);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6 mb-8 bg-white shadow-lg border-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarLucide className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">posts Calendar</h1>
          </div>
          <div>
            <Button
              onClick={handleNavigateToday}
              variant="outline"
              className="gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Today
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          Assign postss to specific dates. Past dates are disabled.
          <span className="text-blue-500 font-medium ml-1">
            Dates with assigned postss are highlighted in blue
          </span>
          .
        </p>

        <div style={{ height: 600 }}>
          <BigCalendar
            localizer={localizer}
            events={formattedEvents}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={calendarStyles.event}
            dayPropGetter={calendarStyles.dayWrapper}
            className="p-4 calendar-custom"
            tooltipAccessor={(event) => event.title}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </Card>

      <AssignDailyEvent
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedDate={selectedDate}
      />

      <Dialog open={showEventsDialog} onOpenChange={setShowEventsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Events for{" "}
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event, index) => (
                  <Card
                    key={event.$id || index}
                    className="p-4 border border-gray-200"
                  >
                    <div className="flex flex-col gap-3">
                      <h3 className="text-lg font-semibold">
                        {format(new Date(event.date), "h:mm a")}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {event.posts &&
                          event.posts.map(
                            (posts: any, tIndex: number) => (
                              <div
                                key={posts.$id || tIndex}
                                className="flex flex-col gap-2 border rounded-md p-3 bg-gray-50"
                              >
                                {posts.previewImage && (
                                  <div className="relative w-full h-32">
                                    <Image
                                      src={posts.previewImage}
                                      alt={posts.name || "posts preview"}
                                      fill
                                      className="object-contain rounded-md"
                                    />
                                  </div>
                                )}
                                <p className="font-medium">
                                  {posts.name || "Untitled posts"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {posts.width} x {posts.height}px
                                </p>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No events found for this date.</p>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowEventsDialog(false);
                setIsDialogOpen(true);
              }}
            >
              Add Another Event
            </Button>
            <Button onClick={() => setShowEventsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
