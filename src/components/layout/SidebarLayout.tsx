import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Home,
  Settings,
  Users,
  FileText,
  Package,
  User,
  Menu,
  X,
  database,
  Scissors
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  isActive: boolean;
}

const SidebarItem = ({ icon: Icon, label, to, isActive }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

interface SidebarLayoutProps {
  children: ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const sidebarNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Appointments",
      href: "/appointments",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Billing",
      href: "/billing",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: <database className="h-5 w-5" />,
    },
    {
      title: "Customers",
      href: "/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Inventory",
      href: "/inventory",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Services",
      href: "/services",
      icon: <Scissors className="h-5 w-5" />,
    },
    {
      title: "Staff",
      href: "/staff",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar toggle */}
      <div className="fixed z-20 top-4 left-4 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-10 inset-y-0 left-0 w-64 bg-card shadow-md transition-transform lg:translate-x-0 lg:static lg:w-64 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            GlowUp Suite
          </h1>
        </div>
        <div className="flex-1 px-3 py-4 space-y-1">
          {sidebarNavItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.title}
              to={item.href}
              isActive={location.pathname === item.href}
            />
          ))}
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SidebarLayout;
