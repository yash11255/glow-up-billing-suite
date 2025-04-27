
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PlusIcon, Search, Edit, Trash2, Mail, Phone } from "lucide-react";
import { StaffForm } from "@/components/staff/StaffForm";
import { StaffMember } from "@/types";
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

interface StaffFormData {
  name: string;
  position: string;
  phone?: string;
  email?: string;
}

const Staff = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Fetch staff
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
      return data as StaffMember[];
    }
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (staffMember: StaffFormData) => {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: staffMember.name,
          position: staffMember.position,
          phone: staffMember.phone || null,
          email: staffMember.email || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Staff member added successfully");
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setOpenAddDialog(false);
    },
    onError: (error) => {
      toast.error(`Error adding staff member: ${error.message}`);
    }
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, staffMember }: { id: string; staffMember: StaffFormData }) => {
      const { data, error } = await supabase
        .from('staff')
        .update({
          name: staffMember.name,
          position: staffMember.position,
          phone: staffMember.phone || null,
          email: staffMember.email || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Staff member updated successfully");
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setOpenEditDialog(false);
      setEditStaff(null);
    },
    onError: (error) => {
      toast.error(`Error updating staff member: ${error.message}`);
    }
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Staff member deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (error) => {
      toast.error(`Error deleting staff member: ${error.message}`);
    }
  });

  // Handle Add Staff
  const handleAddStaff = (staffMember: StaffFormData) => {
    createStaffMutation.mutate(staffMember);
  };

  // Handle Edit Staff
  const handleEditStaff = (staffMember: StaffFormData) => {
    if (!editStaff) return;
    updateStaffMutation.mutate({
      id: editStaff.id,
      staffMember,
    });
  };

  // Handle Edit Button Click
  const handleEditClick = (staffMember: StaffMember) => {
    setEditStaff(staffMember);
    setOpenEditDialog(true);
  };

  // Filter staff based on search query
  const filteredStaff = staff?.filter(
    (staffMember) =>
      staffMember.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staffMember.position && staffMember.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staffMember.phone && staffMember.phone.includes(searchQuery)) ||
      (staffMember.email && staffMember.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in animate-delay-200">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search staff..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Add staff details to your salon database.
              </DialogDescription>
            </DialogHeader>
            <StaffForm onSubmit={handleAddStaff} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="animate-fade-in animate-delay-300">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading staff...</div>
          </div>
        ) : filteredStaff && filteredStaff.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Staff List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staffMember) => (
                      <TableRow key={staffMember.id}>
                        <TableCell className="font-medium">{staffMember.name}</TableCell>
                        <TableCell>{staffMember.position || "-"}</TableCell>
                        <TableCell>
                          {staffMember.phone ? (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                              {staffMember.phone}
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {staffMember.email ? (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                              {staffMember.email}
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(staffMember)}
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
                                    This will permanently delete {staffMember.name}'s record.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteStaffMutation.mutate(staffMember.id)}
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
            <p className="text-muted-foreground mb-4">No staff members found</p>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button>Add Staff Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                  <DialogDescription>
                    Add staff details to your salon database.
                  </DialogDescription>
                </DialogHeader>
                <StaffForm onSubmit={handleAddStaff} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Edit Staff Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff details.</DialogDescription>
          </DialogHeader>
          {editStaff && (
            <StaffForm
              onSubmit={handleEditStaff}
              initialData={{
                name: editStaff.name,
                position: editStaff.position || "",
                phone: editStaff.phone || "",
                email: editStaff.email || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Staff;
