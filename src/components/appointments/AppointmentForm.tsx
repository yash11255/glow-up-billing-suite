import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { Spinner } from "@/components/ui/spinner";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  customer_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  notes: string;
  user_id: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface AppointmentFormProps {
  onSubmit: (appointment: Partial<Appointment>) => void;
  initialData?: Partial<Appointment>;
  initialDate?: Date;
}

export const AppointmentForm = ({ onSubmit, initialData = {}, initialDate }: AppointmentFormProps) => {
  const { user } = useAuth();
  
  // If initialDate is provided and there's no start_time in initialData,
  // set default start_time based on initialDate
  const defaultStartTime = initialDate ? new Date(initialDate).toISOString().slice(0, 16) : '';
  
  // If initialDate is provided and there's no end_time in initialData,
  // set default end_time based on initialDate + 1 hour
  let defaultEndTime = '';
  if (initialDate) {
    const endDate = new Date(initialDate);
    endDate.setHours(endDate.getHours() + 1);
    defaultEndTime = endDate.toISOString().slice(0, 16);
  }
  
  const [appointment, setAppointment] = useState<Partial<Appointment>>({
    ...initialData,
    user_id: user?.id,
    start_time: initialData.start_time || defaultStartTime,
    end_time: initialData.end_time || defaultEndTime
  });

  const [customerSearch, setCustomerSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customer, setCustomer] = useState<Partial<Customer>>({});
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast.error("Error fetching services");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchCustomer = async () => {
    if (!customerSearch || customerSearch.length < 3) return;
    
    try {
      setIsSearching(true);
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .or(`name.ilike.%${customerSearch}%,phone.ilike.%${customerSearch}%`)
        .eq("user_id", user?.id);
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      toast.error("Error searching customers");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (customerSearch.length >= 3) {
        searchCustomer();
      }
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [customerSearch]);

  const handleSelectCustomer = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer);
    setAppointment(prev => ({ ...prev, customer_id: selectedCustomer.id }));
    setSearchResults([]);
    setCustomerSearch(selectedCustomer.name);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAppointment(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If it's a new customer, create them first
    if (isNewCustomer && !appointment.customer_id) {
      try {
        const { data, error } = await supabase
          .from("customers")
          .insert([{ ...customer, user_id: user?.id }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Set the newly created customer ID
        setAppointment(prev => ({ ...prev, customer_id: data.id }));
        onSubmit({ ...appointment, customer_id: data.id });
        return;
      } catch (error: any) {
        toast.error("Error creating customer");
        console.error(error);
        return;
      }
    }
    
    // Otherwise submit with existing data
    onSubmit(appointment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Customer</Label>
        {!isNewCustomer ? (
          <>
            <div className="relative">
              <Input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customer by name or phone"
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Spinner size="sm" />
                </div>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="border rounded-md mt-1 max-h-60 overflow-y-auto">
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    className="p-2 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSelectCustomer(result)}
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className="text-xs text-muted-foreground">{result.phone}</div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="link" 
                className="text-xs h-auto py-0"
                onClick={() => setIsNewCustomer(true)}
              >
                Add new customer
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3 border p-3 rounded-md">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={customer.name || ""}
                onChange={handleCustomerChange}
                placeholder="Customer name"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={customer.phone || ""}
                onChange={handleCustomerChange}
                placeholder="Customer phone"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                className="text-xs h-auto py-1"
                onClick={() => setIsNewCustomer(false)}
              >
                Back to search
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="service_id">Service</Label>
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Spinner />
          </div>
        ) : (
          <select
            id="service_id"
            name="service_id"
            value={appointment.service_id || ""}
            onChange={handleChange}
            className="w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm"
          >
            <option value="">Select a service</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - ₹{service.price} ({service.duration} min)
              </option>
            ))}
          </select>
        )}
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
