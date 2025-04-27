
import { Badge } from "@/components/ui/badge";

type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no-show";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export const AppointmentStatusBadge = ({ status }: AppointmentStatusBadgeProps) => {
  switch (status) {
    case "scheduled":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
    case "no-show":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">No Show</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
