
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Customers = () => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) {
        toast.error("Error loading customers");
        throw error;
      }
      return data;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 animate-fade-in">
          Customers
        </h1>
        <p className="text-muted-foreground animate-fade-in animate-delay-100">
          Manage your salon customers
        </p>
      </div>

      <div className="animate-fade-in animate-delay-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading customers...</div>
          </div>
        ) : (
          customers && customers.length > 0 ? (
            <div className="bg-card rounded-xl shadow-sm p-6">
              {/* Customer list will be implemented here */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground">No customers found</p>
              <Button className="mt-4">Add Customer</Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Customers;
