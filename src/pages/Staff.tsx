
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Staff = () => {
  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      
      if (error) {
        toast.error("Error loading staff");
        throw error;
      }
      return data;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 animate-fade-in">
          Staff Management
        </h1>
        <p className="text-muted-foreground animate-fade-in animate-delay-100">
          Manage your salon staff
        </p>
      </div>

      <div className="animate-fade-in animate-delay-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading staff...</div>
          </div>
        ) : (
          staff && staff.length > 0 ? (
            <div className="bg-card rounded-xl shadow-sm p-6">
              {/* Staff list will be implemented here */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground">No staff members found</p>
              <Button className="mt-4">Add Staff Member</Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Staff;
