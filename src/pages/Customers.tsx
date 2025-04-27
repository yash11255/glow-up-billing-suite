
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PlusIcon, Search, Edit, Trash2, Phone, Calendar } from "lucide-react";
import { CustomerForm } from "@/components/billing/CustomerForm";
import { Customer } from "@/types";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { useAuth } from "@/contexts/AuthContext";

interface CustomerFormData {
  name: string;
  phone: string;
  birthday?: string;
  anniversary?: string;
  notes?: string;
}

const Customers = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Fetch customers
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
      return data as Customer[];
    }
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customer: CustomerFormData) => {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          phone: customer.phone,
          birthday: customer.birthday || null,
          anniversary: customer.anniversary || null,
          notes: customer.notes || null,
          user_id: user?.id || '123', // Add user_id field
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Customer added successfully");
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpenAddDialog(false);
    },
    onError: (error) => {
      toast.error(`Error adding customer: ${error.message}`);
    }
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, customer }: { id: string; customer: CustomerFormData }) => {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          phone: customer.phone,
          birthday: customer.birthday || null,
          anniversary: customer.anniversary || null,
          notes: customer.notes || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Customer updated successfully");
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpenEditDialog(false);
      setEditCustomer(null);
    },
    onError: (error) => {
      toast.error(`Error updating customer: ${error.message}`);
    }
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Customer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      toast.error(`Error deleting customer: ${error.message}`);
    }
  });

  // Handle Add Customer
  const handleAddCustomer = (customer: CustomerFormData) => {
    createCustomerMutation.mutate(customer);
  };

  // Handle Edit Customer
  const handleEditCustomer = (customer: CustomerFormData) => {
    if (!editCustomer) return;
    updateCustomerMutation.mutate({
      id: editCustomer.id,
      customer,
    });
  };

  // Handle Edit Button Click
  const handleEditClick = (customer: Customer) => {
    setEditCustomer(customer);
    setOpenEditDialog(true);
  };

  // Filter customers based on search query
  const filteredCustomers = customers?.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      return "-";
    }
  };

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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in animate-delay-200">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Add customer details to your salon database.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm onSubmit={handleAddCustomer} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="animate-fade-in animate-delay-300">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading customers...</div>
          </div>
        ) : filteredCustomers && filteredCustomers.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Birthday</TableHead>
                      <TableHead>Anniversary</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.birthday && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-primary" />
                              {formatDate(customer.birthday)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {customer.anniversary && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-secondary" />
                              {formatDate(customer.anniversary)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {customer.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(customer)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete {customer.name}'s record.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteCustomerMutation.mutate(customer.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">No customers found</p>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button>Add Customer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Add customer details to your salon database.
                  </DialogDescription>
                </DialogHeader>
                <CustomerForm onSubmit={handleAddCustomer} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer details.</DialogDescription>
          </DialogHeader>
          {editCustomer && (
            <CustomerForm
              onSubmit={handleEditCustomer}
              initialData={{
                name: editCustomer.name,
                phone: editCustomer.phone,
                birthday: editCustomer.birthday,
                anniversary: editCustomer.anniversary,
                notes: editCustomer.notes,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
