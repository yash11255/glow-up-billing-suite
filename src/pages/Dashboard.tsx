
import { useState } from "react";
import { Calendar, FileText, Package, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { StaffPerformance } from "@/components/dashboard/StaffPerformance";

const Dashboard = () => {
  // Mock data for demonstration
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily");

  const stats = {
    daily: {
      sales: "₹12,500",
      customers: "8",
      services: "15",
      products: "5",
    },
    weekly: {
      sales: "₹85,200",
      customers: "42",
      services: "78",
      products: "23",
    },
    monthly: {
      sales: "₹3,25,000",
      customers: "156",
      services: "312",
      products: "87",
    },
  };

  const mockTransactions = [
    {
      id: "bill-001",
      customer: "Priya Sharma",
      amount: "₹1,850",
      status: "completed" as "completed" | "pending" | "cancelled",
      date: "Today, 10:30 AM",
    },
    {
      id: "bill-002",
      customer: "Arjun Patel",
      amount: "₹2,500",
      status: "completed" as "completed" | "pending" | "cancelled",
      date: "Today, 11:45 AM",
    },
    {
      id: "bill-003",
      customer: "Sneha Gupta",
      amount: "₹950",
      status: "completed" as "completed" | "pending" | "cancelled",
      date: "Yesterday, 4:15 PM",
    },
    {
      id: "bill-004",
      customer: "Vikram Singh",
      amount: "₹3,200",
      status: "pending" as "completed" | "pending" | "cancelled",
      date: "Yesterday, 6:30 PM",
    },
    {
      id: "bill-005",
      customer: "Neha Kapoor",
      amount: "₹1,500",
      status: "cancelled" as "completed" | "pending" | "cancelled",
      date: "2 days ago, 3:00 PM",
    },
  ];

  const mockEvents = [
    {
      id: "event-001",
      type: "birthday" as "birthday" | "anniversary",
      customerName: "Meera Reddy",
      date: "Tomorrow, April 27",
      phone: "+91 98765 43210",
    },
    {
      id: "event-002",
      type: "anniversary" as "birthday" | "anniversary",
      customerName: "Rahul & Anita Verma",
      date: "Apr 30, 2025",
      phone: "+91 87654 32109",
    },
    {
      id: "event-003",
      type: "birthday" as "birthday" | "anniversary",
      customerName: "Kiran Joshi",
      date: "May 2, 2025",
      phone: "+91 76543 21098",
    },
  ];

  const mockStaff = [
    {
      id: "staff-001",
      name: "Anjali Sharma",
      position: "Senior Stylist",
      servicesCompleted: 42,
      revenue: "₹68,500",
    },
    {
      id: "staff-002",
      name: "Rajat Kumar",
      position: "Hair Specialist",
      servicesCompleted: 38,
      revenue: "₹59,200",
    },
    {
      id: "staff-003",
      name: "Pooja Singh",
      position: "Makeup Artist",
      servicesCompleted: 26,
      revenue: "₹42,300",
    },
    {
      id: "staff-004",
      name: "Vivek Malhotra",
      position: "Junior Stylist",
      servicesCompleted: 23,
      revenue: "₹31,800",
    },
  ];

  const currentStats = stats[timeRange];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 animate-fade-in">
          Dashboard
        </h1>
        <p className="text-muted-foreground animate-fade-in animate-delay-100">
          Welcome back to your salon management dashboard
        </p>
      </div>

      <div className="flex flex-wrap gap-2 animate-fade-in animate-delay-200">
        <button
          onClick={() => setTimeRange("daily")}
          className={`px-3 py-1 text-sm rounded-md ${
            timeRange === "daily"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setTimeRange("weekly")}
          className={`px-3 py-1 text-sm rounded-md ${
            timeRange === "weekly"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setTimeRange("monthly")}
          className={`px-3 py-1 text-sm rounded-md ${
            timeRange === "monthly"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Monthly
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in animate-delay-300">
        <StatsCard
          title="Total Sales"
          value={currentStats.sales}
          icon={<FileText />}
          trend="up"
          trendValue="12%"
        />
        <StatsCard
          title="Customers"
          value={currentStats.customers}
          icon={<Users />}
          trend="up"
          trendValue="8%"
        />
        <StatsCard
          title="Services"
          value={currentStats.services}
          icon={<FileText />}
        />
        <StatsCard
          title="Products Sold"
          value={currentStats.products}
          icon={<Package />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-400">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={mockTransactions} />
        </div>
        <div>
          <UpcomingEvents events={mockEvents} />
        </div>
      </div>

      <div className="animate-fade-in animate-delay-500">
        <StaffPerformance staffMembers={mockStaff} />
      </div>
    </div>
  );
};

export default Dashboard;
