
import { signOut } from "@/services/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const UserProfileMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };
  
  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:block">
        <p className="text-sm font-medium">{user?.email}</p>
        <p className="text-xs text-muted-foreground">Salon Manager</p>
      </div>
      
      <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};
