
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Appointment } from "@/types";
import { parseISO } from "date-fns";

interface WeekViewProps {
  weekDays: Date[];
  appointments: {
    day: Date;
    appointments: Appointment[];
  }[];
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export const WeekView = ({ weekDays, appointments, onDayClick, onAppointmentClick }: WeekViewProps) => {
  return (
    <div className="grid grid-cols-7 gap-4">
      {appointments.map(({ day, appointments }) => (
        <Card key={format(day, 'yyyy-MM-dd')} className={cn(
          "h-[50vh] overflow-y-auto",
          isToday(day) && "ring-2 ring-primary"
        )}>
          <CardHeader className="p-3 pb-2">
            <CardTitle className={cn(
              "text-center text-sm",
              isToday(day) && "text-primary font-bold"
            )}>
              <div>{format(day, 'EEE')}</div>
              <div className="text-lg">{format(day, 'd')}</div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {appointments.length > 0 ? (
              <div className="space-y-2">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={cn(
                      "p-2 rounded-md text-xs cursor-pointer",
                      appointment.status === 'cancelled' && "bg-red-100",
                      appointment.status === 'completed' && "bg-green-100",
                      appointment.status === 'scheduled' && "bg-blue-100",
                      appointment.status === 'no-show' && "bg-amber-100",
                    )}
                    onClick={() => onAppointmentClick(appointment)}
                  >
                    <div className="font-medium">
                      {format(parseISO(appointment.start_time), "h:mm a")}
                    </div>
                    <div>{appointment.service_name}</div>
                    <div className="truncate">{appointment.customers?.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex items-center justify-center h-24 text-xs text-muted-foreground"
                onClick={() => onDayClick(day)}
              >
                <div className="text-center">
                  <Plus className="h-4 w-4 mx-auto mb-1" />
                  <span>Add</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
