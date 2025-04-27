
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Appointments = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 animate-fade-in">
          Appointments
        </h1>
        <p className="text-muted-foreground animate-fade-in animate-delay-100">
          Manage your salon appointments
        </p>
      </div>

      <div className="animate-fade-in animate-delay-200">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground">Your appointments will appear here</p>
          <Button className="mt-4">Create Appointment</Button>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
