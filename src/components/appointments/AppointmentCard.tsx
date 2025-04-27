
import { format, parseISO } from "date-fns";
import { Clock, Scissors, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { Appointment } from "@/types";

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onCancel: (id: string) => void;
}

export const AppointmentCard = ({ appointment, onEdit, onCancel }: AppointmentCardProps) => {
  return (
    <Card key={appointment.id} className="overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(parseISO(appointment.start_time), "h:mm a")} - {format(parseISO(appointment.end_time), "h:mm a")}
            </span>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <CardTitle className="text-lg">{appointment.service_name}</CardTitle>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(appointment)}
          >
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive">
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark the appointment as cancelled. You can still view it in your appointment history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep it</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onCancel(appointment.id)}
                >
                  Yes, cancel it
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              {appointment.customers?.name || "No customer"} {appointment.customers?.phone ? `(${appointment.customers.phone})` : ""}
            </span>
          </div>
          <div className="flex items-center">
            <Scissors className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{appointment.staff?.name || "Unassigned"}</span>
          </div>
        </div>
        {appointment.notes && (
          <p className="mt-2 text-sm text-muted-foreground">
            Notes: {appointment.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
