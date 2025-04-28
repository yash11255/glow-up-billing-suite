
import { Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface Event {
  id: string;
  type: "birthday" | "anniversary" | "reminder";
  customerName: string;
  date: string;
  phone: string;
  message?: string;
}

interface UpcomingEventsProps {
  events: Event[];
}

export const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  const [open, setOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [message, setMessage] = useState("");

  const handleSendMessage = (type: "sms" | "whatsapp") => {
    // Placeholder for message sending functionality
    toast.success(`Message will be sent via ${type === "sms" ? "SMS" : "WhatsApp"}`);
    setMessageOpen(false);
  };

  const openMessageDialog = (event: Event) => {
    setSelectedEvent(event);
    setMessage(`Hi ${event.customerName}, this is a reminder from your salon.`);
    setMessageOpen(true);
  };

  return (
    <div className="bg-card rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        <DialogTrigger asChild onClick={() => setOpen(true)}>
          <Button variant="outline" size="sm">
            Add Reminder
          </Button>
        </DialogTrigger>
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
                      : event.type === "anniversary"
                      ? "bg-secondary"
                      : "bg-amber-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  {event.type === "birthday" 
                    ? "Birthday" 
                    : event.type === "anniversary" 
                    ? "Anniversary" 
                    : "Reminder"}
                </span>
              </div>
              <div className="mt-2">
                <h3 className="font-medium">{event.customerName}</h3>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openMessageDialog(event)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Send Message
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reminder Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
            <DialogDescription>
              Create a new reminder for a customer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reminderCustomer" className="text-right">
                Customer
              </Label>
              <Input
                id="reminderCustomer"
                className="col-span-3"
                placeholder="Customer name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reminderDate" className="text-right">
                Date
              </Label>
              <Input
                id="reminderDate"
                type="date"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reminderTime" className="text-right">
                Time
              </Label>
              <Input
                id="reminderTime"
                type="time"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reminderNote" className="text-right">
                Note
              </Label>
              <Input
                id="reminderNote"
                className="col-span-3"
                placeholder="Add a note"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success("Reminder added");
              setOpen(false);
            }}>
              Save Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              {selectedEvent && `Send a message to ${selectedEvent.customerName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="messageContent">Message</Label>
              <textarea
                id="messageContent"
                className="w-full rounded-md border-border px-3 py-2 bg-background text-foreground min-h-[100px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSendMessage("sms")}
              >
                Send SMS
              </Button>
              <Button 
                className="w-full"
                onClick={() => handleSendMessage("whatsapp")}
              >
                Send WhatsApp
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
