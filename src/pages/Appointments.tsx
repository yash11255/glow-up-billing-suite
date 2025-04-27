import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, addDays, startOfWeek, isToday, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, User, Scissors, Calendar, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { Appointment } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Appointments = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i)
  );

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers:customer_id (
            id,
            name,
            phone
          ),
          staff:staff_id (
            id,
            name
          ),
          services:service_id (
            id,
            name,
            duration,
            price
          )
        `);
      
      if (error) {
        toast.error("Error loading appointments");
        throw error;
      }
      return appointmentsData as unknown as Appointment[];
    }
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointment: Partial<Appointment>) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          customer_id: appointment.customer_id,
          staff_id: appointment.staff_id,
          service_id: appointment.service_id,
          service_name: appointment.service_name,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          status: appointment.status || 'scheduled',
          notes: appointment.notes
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Appointment created successfully");
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setOpenAddDialog(false);
    },
    onError: (error) => {
      toast.error(`Error creating appointment: ${error.message}`);
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, appointment }: { id: string; appointment: Partial<Appointment> }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          customer_id: appointment.customer_id,
          staff_id: appointment.staff_id,
          service_id: appointment.service_id,
          service_name: appointment.service_name,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          status: appointment.status,
          notes: appointment.notes
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Appointment updated successfully");
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setOpenEditDialog(false);
      setAppointmentToEdit(null);
    },
    onError: (error) => {
      toast.error(`Error updating appointment: ${error.message}`);
    }
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Appointment cancelled");
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      toast.error(`Error cancelling appointment: ${error.message}`);
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Appointment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      toast.error(`Error deleting appointment: ${error.message}`);
    }
  });

  const handleAddAppointment = (appointment: Partial<Appointment>) => {
    createAppointmentMutation.mutate(appointment);
  };

  const handleEditAppointment = (appointment: Partial<Appointment>) => {
    if (!appointmentToEdit) return;
    updateAppointmentMutation.mutate({
      id: appointmentToEdit.id,
      appointment,
    });
  };

  const handleEditClick = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setOpenEditDialog(true);
  };

  const dayAppointments = appointments?.filter(appointment => {
    try {
      const appointmentDate = parseISO(appointment.start_time);
      return isSameDay(appointmentDate, selectedDate);
    } catch (error) {
      return false;
    }
  });

  const weekAppointments = weekDays.map(day => {
    return {
      day,
      appointments: appointments?.filter(appointment => {
        try {
          const appointmentDate = parseISO(appointment.start_time);
          return isSameDay(appointmentDate, day);
        } catch (error) {
          return false;
        }
      }) || []
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      case 'no-show':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

      <div className="flex flex-wrap gap-4 justify-between items-center animate-fade-in animate-delay-200">
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedDate(prev => addDays(prev, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous day</span>
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedDate(prev => addDays(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next day</span>
            </Button>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week")}>
            <TabsList className="grid w-32 grid-cols-2">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Appointment</DialogTitle>
                <DialogDescription>
                  Schedule a new appointment for your customer.
                </DialogDescription>
              </DialogHeader>
              <AppointmentForm 
                onSubmit={handleAddAppointment} 
                initialDate={selectedDate} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="animate-fade-in animate-delay-300">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading appointments...</div>
          </div>
        ) : (
          viewMode === "day" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  {isToday(selectedDate) && (
                    <Badge className="ml-2">Today</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Appointments scheduled for this day
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dayAppointments && dayAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {dayAppointments.map((appointment) => (
                      <Card key={appointment.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(parseISO(appointment.start_time), "h:mm a")} - {format(parseISO(appointment.end_time), "h:mm a")}
                              </span>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <CardTitle className="text-lg">{appointment.service_name}</CardTitle>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditClick(appointment)}
                            >
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will mark the appointment as cancelled. You can still view it in your appointment history.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No, keep it</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                                  >
                                    Yes, cancel it
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {appointment.customers?.name || "No customer"} {appointment.customers?.phone ? `(${appointment.customers.phone})` : ""}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Scissors className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{appointment.staff?.name || "Unassigned"}</span>
                            </div>
                          </div>
                          {appointment.notes && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              Notes: {appointment.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No appointments scheduled for this day</p>
                    <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                      <DialogTrigger asChild>
                        <Button>Schedule an Appointment</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add New Appointment</DialogTitle>
                          <DialogDescription>
                            Schedule a new appointment for your customer.
                          </DialogDescription>
                        </DialogHeader>
                        <AppointmentForm 
                          onSubmit={handleAddAppointment} 
                          initialDate={selectedDate} 
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {weekAppointments.map(({ day, appointments }) => (
                <Card key={format(day, 'yyyy-MM-dd')} className={cn(
                  "h-[50vh] overflow-y-auto",
                  isToday(day) && "ring-2 ring-primary"
                )}>
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className={cn(
                      "text-center text-sm",
                      isToday(day) && "text-primary font-bold"
                    )}>
                      <div>{format(day, 'EEE')}</div>
                      <div className="text-lg">{format(day, 'd')}</div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    {appointments.length > 0 ? (
                      <div className="space-y-2">
                        {appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className={cn(
                              "p-2 rounded-md text-xs cursor-pointer",
                              appointment.status === 'cancelled' && "bg-red-100",
                              appointment.status === 'completed' && "bg-green-100",
                              appointment.status === 'scheduled' && "bg-blue-100",
                              appointment.status === 'no-show' && "bg-amber-100",
                            )}
                            onClick={() => handleEditClick(appointment)}
                          >
                            <div className="font-medium">
                              {format(parseISO(appointment.start_time), "h:mm a")}
                            </div>
                            <div>{appointment.service_name}</div>
                            <div className="truncate">{appointment.customers?.name}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center h-24 text-xs text-muted-foreground"
                        onClick={() => {
                          setSelectedDate(day);
                          setOpenAddDialog(true);
                        }}
                      >
                        <div className="text-center">
                          <Plus className="h-4 w-4 mx-auto mb-1" />
                          <span>Add</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update appointment details.
            </DialogDescription>
          </DialogHeader>
          {appointmentToEdit && (
            <AppointmentForm
              onSubmit={handleEditAppointment}
              initialData={appointmentToEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
