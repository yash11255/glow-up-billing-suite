
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  type: "birthday" | "anniversary";
  customerName: string;
  date: string;
  phone: string;
}

interface UpcomingEventsProps {
  events: Event[];
}

export const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  return (
    <div className="bg-card rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No upcoming events
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    event.type === "birthday"
                      ? "bg-primary"
                      : "bg-secondary"
                  }`}
                />
                <span className="text-sm font-medium">
                  {event.type === "birthday" ? "Birthday" : "Anniversary"}
                </span>
              </div>
              <div className="mt-2">
                <h3 className="font-medium">{event.customerName}</h3>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm">
                  Send SMS
                </Button>
                <Button variant="outline" size="sm">
                  Send WhatsApp
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
