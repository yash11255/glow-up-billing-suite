import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, addHours, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Customer, StaffMember, Service, Appointment } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AppointmentFormProps {
  onSubmit: (appointment: Partial<Appointment>) => void;
  initialData?: Partial<Appointment>;
  initialDate?: Date;
}

export const AppointmentForm = ({
  onSubmit,
  initialData,
  initialDate = new Date(),
}: AppointmentFormProps) => {
  const [formData, setFormData] = useState<Partial<Appointment>>({
    customer_id: initialData?.customer_id || "",
    staff_id: initialData?.staff_id || "",
    service_id: initialData?.service_id || "",
    service_name: initialData?.service_name || "",
    start_time: initialData?.start_time || format(initialDate, "yyyy-MM-dd'T'HH:mm"),
    end_time: initialData?.end_time || format(addHours(initialDate, 1), "yyyy-MM-dd'T'HH:mm"),
    status: initialData?.status || "scheduled",
    notes: initialData?.notes || "",
  });
  const [date, setDate] = useState<Date>(
    initialData?.start_time 
      ? parseISO(initialData.start_time) 
      : initialDate
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch customers
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Customer[];
    }
  });

  // Fetch staff
  const { data: staff } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as StaffMember[];
    }
  });

  // Fetch services
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Service[];
    }
  });

  // Update start and end time when date changes
  useEffect(() => {
    if (date) {
      const currentStartTime = formData.start_time ? parseISO(formData.start_time) : new Date();
      const currentEndTime = formData.end_time ? parseISO(formData.end_time) : addHours(new Date(), 1);
      
      // Keep the time part but update the date part
      const newStartTime = new Date(date);
      newStartTime.setHours(currentStartTime.getHours(), currentStartTime.getMinutes(), 0, 0);
      
      const newEndTime = new Date(date);
      newEndTime.setHours(currentEndTime.getHours(), currentEndTime.getMinutes(), 0, 0);
      
      setFormData((prev) => ({
        ...prev,
        start_time: format(newStartTime, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(newEndTime, "yyyy-MM-dd'T'HH:mm"),
      }));
    }
  }, [date]);

  // Update end time based on service duration when service changes
  useEffect(() => {
    if (formData.service_id && services) {
      const selectedService = services.find(service => service.id === formData.service_id);
      if (selectedService && formData.start_time) {
        const startTime = parseISO(formData.start_time);
        const endTime = addHours(startTime, selectedService.duration / 60);
        
        setFormData((prev) => ({
          ...prev,
          service_name: selectedService.name,
          end_time: format(endTime, "yyyy-MM-dd'T'HH:mm"),
        }));
      }
    }
  }, [formData.service_id, formData.start_time, services]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }
    
    if (!formData.staff_id) {
      newErrors.staff_id = "Staff member is required";
    }
    
    if (!formData.service_id) {
      newErrors.service_id = "Service is required";
    }
    
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }
    
    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
    } else if (formData.start_time && formData.end_time) {
      const start = parseISO(formData.start_time);
      const end = parseISO(formData.end_time);
      if (end <= start) {
        newErrors.end_time = "End time must be after start time";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTimeChange = (name: string, value: string) => {
    try {
      if (name === 'start_time' || name === 'end_time') {
        const [hours, minutes] = value.split(':').map(Number);
        const newTime = new Date(date);
        newTime.setHours(hours, minutes, 0, 0);
        
        setFormData((prev) => ({
          ...prev,
          [name]: format(newTime, "yyyy-MM-dd'T'HH:mm"),
        }));
        
        // Clear error when field is edited
        if (errors[name]) {
          setErrors((prev) => ({
            ...prev,
            [name]: "",
          }));
        }
      }
    } catch (error) {
      console.error("Error parsing time:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Format time for display in time picker
  const formatTimeForPicker = (dateTimeString?: string) => {
    if (!dateTimeString) return "09:00";
    try {
      return format(parseISO(dateTimeString), "HH:mm");
    } catch (error) {
      return "09:00";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time" className={errors.start_time ? "text-destructive" : ""}>
            Start Time *
          </Label>
          <div className="flex">
            <Clock className="h-4 w-4 mr-2 mt-2.5 text-muted-foreground" />
            <Input
              id="start_time"
              type="time"
              value={formatTimeForPicker(formData.start_time)}
              onChange={(e) => handleTimeChange("start_time", e.target.value)}
              className={errors.start_time ? "border-destructive" : ""}
            />
          </div>
          {errors.start_time && <p className="text-xs text-destructive">{errors.start_time}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end_time" className={errors.end_time ? "text-destructive" : ""}>
            End Time *
          </Label>
          <div className="flex">
            <Clock className="h-4 w-4 mr-2 mt-2.5 text-muted-foreground" />
            <Input
              id="end_time"
              type="time"
              value={formatTimeForPicker(formData.end_time)}
              onChange={(e) => handleTimeChange("end_time", e.target.value)}
              className={errors.end_time ? "border-destructive" : ""}
            />
          </div>
          {errors.end_time && <p className="text-xs text-destructive">{errors.end_time}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_id" className={errors.customer_id ? "text-destructive" : ""}>
          Customer *
        </Label>
        <Select 
          value={formData.customer_id || ""}
          onValueChange={(value) => handleSelectChange("customer_id", value)}
        >
          <SelectTrigger className={errors.customer_id ? "border-destructive" : ""}>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers?.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name} ({customer.phone})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customer_id && <p className="text-xs text-destructive">{errors.customer_id}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="service_id" className={errors.service_id ? "text-destructive" : ""}>
          Service *
        </Label>
        <Select 
          value={formData.service_id || ""}
          onValueChange={(value) => handleSelectChange("service_id", value)}
        >
          <SelectTrigger className={errors.service_id ? "border-destructive" : ""}>
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            {services?.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name} - {service.duration} min (₹{service.price})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service_id && <p className="text-xs text-destructive">{errors.service_id}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="staff_id" className={errors.staff_id ? "text-destructive" : ""}>
          Staff Member *
        </Label>
        <Select 
          value={formData.staff_id || ""}
          onValueChange={(value) => handleSelectChange("staff_id", value)}
        >
          <SelectTrigger className={errors.staff_id ? "border-destructive" : ""}>
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {staff?.map((staffMember) => (
              <SelectItem key={staffMember.id} value={staffMember.id}>
                {staffMember.name} - {staffMember.position || "Staff"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.staff_id && <p className="text-xs text-destructive">{errors.staff_id}</p>}
      </div>

      {initialData && initialData.id && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status || "scheduled"}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleInputChange}
          placeholder="Add any special requests or notes"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        {initialData?.id ? "Update Appointment" : "Create Appointment"}
      </Button>
    </form>
  );
};
