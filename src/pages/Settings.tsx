
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Settings = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 animate-fade-in">
          Settings
        </h1>
        <p className="text-muted-foreground animate-fade-in animate-delay-100">
          Manage your salon settings
        </p>
      </div>

      <div className="animate-fade-in animate-delay-200">
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            {/* Settings form will be implemented here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
