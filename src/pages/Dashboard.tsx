
import { useState, useEffect } from "react";
import { Calendar, FileText, Package, Users, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { StaffPerformance } from "@/components/dashboard/StaffPerformance";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/supabase";
import { DashboardStats } from "@/types";

interface Transaction {
  id: string;
  customer: string;
  amount: string;
  status: "completed" | "pending" | "cancelled";
  date: string;
}

interface StaffMemberPerformance {
  id: string;
  name: string;
  position: string;
  servicesCompleted: number;
  revenue: string;
}

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily");

  // Fetch dashboard stats
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats', timeRange],
    queryFn: async () => {
      const { stats, error } = await getDashboardStats(timeRange);
      if (error) throw error;
      return stats as DashboardStats;
    },
    refetchOnWindowFocus: false,
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Transform bill data to transaction format
  const transformToTransactions = (bills: any[]): Transaction[] => {
    if (!bills) return [];
    return bills.map(bill => ({
      id: bill.id,
      customer: bill.customer || bill.customer_name,
      amount: bill.amount?.toString() || bill.total?.toString(),
      status: bill.status,
      date: bill.date || new Date(bill.created_at).toLocaleString(),
    }));
  };

  // Transform staff performance data
  const transformToStaffPerformance = (staffData: any[]): StaffMemberPerformance[] => {
    if (!staffData) return [];
    return staffData.map(staff => ({
      id: staff.id,
      name: staff.name,
      position: staff.position || '',
      servicesCompleted: staff.servicesCompleted || 0,
      revenue: typeof staff.revenue === 'string' 
        ? staff.revenue 
        : formatCurrency(staff.revenue || 0),
    }));
  };

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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in animate-delay-300">
          <StatsCard
            title="Loading..."
            value="..."
            icon={<FileText />}
          />
          <StatsCard
            title="Loading..."
            value="..."
            icon={<Users />}
          />
          <StatsCard
            title="Loading..."
            value="..."
            icon={<FileText />}
          />
          <StatsCard
            title="Loading..."
            value="..."
            icon={<Package />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in animate-delay-300">
          <StatsCard
            title="Total Sales"
            value={formatCurrency(data?.totalSales || 0)}
            icon={<FileText />}
            trend="up"
            trendValue="12%"
          />
          <StatsCard
            title="Customers"
            value={data?.totalCustomers?.toString() || "0"}
            icon={<Users />}
            trend="up"
            trendValue="8%"
          />
          <StatsCard
            title="Services"
            value={data?.totalServices?.toString() || "0"}
            icon={<FileText />}
          />
          <StatsCard
            title="Products Sold"
            value={data?.totalProducts?.toString() || "0"}
            icon={<Package />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-400">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={transformToTransactions(data?.recentTransactions || [])} />
        </div>
        <div>
          <UpcomingEvents events={data?.upcomingEvents || []} />
        </div>
      </div>

      <div className="animate-fade-in animate-delay-500">
        <StaffPerformance staffMembers={transformToStaffPerformance(data?.staffPerformance || [])} />
      </div>
    </div>
  );
};

export default Dashboard;
