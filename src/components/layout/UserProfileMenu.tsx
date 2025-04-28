
import { signOut } from "@/services/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export const UserProfileMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate("/login");
    }
  };
  
  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{user?.email}</p>
          <p className="text-xs text-muted-foreground">Salon Manager</p>
        </div>
      </div>
      
      <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};
