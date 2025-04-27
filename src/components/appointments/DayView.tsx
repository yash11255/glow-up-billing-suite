
import { format, isToday } from "date-fns";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentCard } from "./AppointmentCard";
import { Appointment } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AppointmentForm } from "./AppointmentForm";

interface DayViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  openAddDialog: boolean;
  setOpenAddDialog: (open: boolean) => void;
  onAddAppointment: (appointment: Partial<Appointment>) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onCancelAppointment: (id: string) => void;
}

export const DayView = ({
  selectedDate,
  appointments,
  openAddDialog,
  setOpenAddDialog,
  onAddAppointment,
  onEditAppointment,
  onCancelAppointment
}: DayViewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
          {isToday(selectedDate) && (
            <Badge className="ml-2">Today</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Appointments scheduled for this day
        </CardDescription>
      </CardHeader>
      <CardContent>
        {appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onEdit={onEditAppointment}
                onCancel={onCancelAppointment}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No appointments scheduled for this day</p>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button>Schedule an Appointment</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Appointment</DialogTitle>
                  <DialogDescription>
                    Schedule a new appointment for your customer.
                  </DialogDescription>
                </DialogHeader>
                <AppointmentForm 
                  onSubmit={onAddAppointment} 
                  initialDate={selectedDate} 
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
