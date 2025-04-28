import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Appointment {
  id: string;
  customer_id: string;
  service_id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  notes: string;
  user_id: string;
}

interface AppointmentFormProps {
  onSubmit: (appointment: Partial<Appointment>) => void;
  initialData?: Partial<Appointment>;
}

export const AppointmentForm = ({ onSubmit, initialData = {} }: AppointmentFormProps) => {
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Partial<Appointment>>({
    ...initialData,
    user_id: user?.id
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAppointment(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(appointment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="customer_id">Customer ID</Label>
        <Input
          type="text"
          id="customer_id"
          name="customer_id"
          value={appointment.customer_id || ""}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="service_id">Service ID</Label>
        <Input
          type="text"
          id="service_id"
          name="service_id"
          value={appointment.service_id || ""}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="staff_id">Staff ID</Label>
        <Input
          type="text"
          id="staff_id"
          name="staff_id"
          value={appointment.staff_id || ""}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="start_time">Start Time</Label>
        <Input
          type="datetime-local"
          id="start_time"
          name="start_time"
          value={appointment.start_time || ""}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="end_time">End Time</Label>
        <Input
          type="datetime-local"
          id="end_time"
          name="end_time"
          value={appointment.end_time || ""}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input
          type="textarea"
          id="notes"
          name="notes"
          value={appointment.notes || ""}
          onChange={handleChange}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
};
