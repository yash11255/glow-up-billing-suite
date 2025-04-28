
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format, startOfDay, startOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trash2 } from "lucide-react";

const Transactions = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Get date range based on selected time range
  const getDateRange = () => {
    const today = new Date();
    
    switch(timeRange) {
      case "daily":
        return {
          start: startOfDay(today),
          end: new Date(today.setHours(23, 59, 59, 999))
        };
      case "weekly":
        return {
          start: startOfWeek(today),
          end: new Date(new Date(startOfWeek(today)).setDate(startOfWeek(today).getDate() + 6))
        };
      case "monthly":
        return {
          start: startOfMonth(today),
          end: endOfMonth(today)
        };
      default:
        return {
          start: startOfDay(today),
          end: new Date(today.setHours(23, 59, 59, 999))
        };
    }
  };
  
  const { start, end } = getDateRange();
  
  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', timeRange],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("bills")
        .select(`
          *,
          bill_services(id, service_name, price, staff_name),
          bill_products(id, product_name, price, quantity)
        `)
        .eq("user_id", user.id)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
  
  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete related bill_services and bill_products
      const deleteServices = supabase
        .from("bill_services")
        .delete()
        .eq("bill_id", id);
        
      const deleteProducts = supabase
        .from("bill_products")
        .delete()
        .eq("bill_id", id);
        
      // Wait for both deletions to complete
      await Promise.all([deleteServices, deleteProducts]);
      
      // Then delete the bill itself
      const { error } = await supabase
        .from("bills")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      toast.success("Transaction removed successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error) => {
      toast.error("Failed to remove transaction");
      console.error(error);
    }
  });
  
  // Calculate totals for the selected time range
  const calculatedTotals = {
    sales: transactions.reduce((acc, bill) => acc + (bill.total || 0), 0),
    services: transactions.reduce((acc, bill) => 
      acc + (bill.bill_services?.reduce((sum, service) => sum + (service.price || 0), 0) || 0), 0),
    products: transactions.reduce((acc, bill) => 
      acc + (bill.bill_products?.reduce((sum, product) => sum + (product.price * (product.quantity || 1) || 0), 0) || 0), 0),
    count: transactions.length
  };
  
  const handleDeleteTransaction = (id: string) => {
    setSelectedTransaction(id);
  };
  
  const confirmDeleteTransaction = () => {
    if (selectedTransaction) {
      deleteMutation.mutate(selectedTransaction);
      setSelectedTransaction(null);
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 animate-fade-in">
          Transactions
        </h1>
        <p className="text-muted-foreground animate-fade-in animate-delay-100">
          View and manage all your sales transactions
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in animate-delay-300">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{calculatedTotals.sales.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Services Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{calculatedTotals.services.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Product Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{calculatedTotals.products.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Transaction Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{calculatedTotals.count}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-card rounded-xl p-6 shadow-sm animate-fade-in animate-delay-400">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p>No transactions found for the selected time range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm')}
                    </TableCell>
                    <TableCell>{transaction.customer_name}</TableCell>
                    <TableCell>
                      {transaction.bill_services && transaction.bill_services.length > 0 
                        ? transaction.bill_services.length 
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {transaction.bill_products && transaction.bill_products.length > 0 
                        ? transaction.bill_products.length 
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{transaction.total.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this transaction? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={confirmDeleteTransaction}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
