
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Appointment } from "@/types";
import { addDays, startOfWeek, isSameDay, parseISO } from "date-fns";

export const useAppointments = () => {
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
          notes: appointment.notes,
          user_id: '123' // This should come from auth context
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

  return {
    selectedDate,
    setSelectedDate,
    openAddDialog,
    setOpenAddDialog,
    viewMode,
    setViewMode,
    appointmentToEdit,
    openEditDialog,
    setOpenEditDialog,
    weekDays,
    appointments,
    isLoading,
    dayAppointments,
    weekAppointments,
    handleAddAppointment,
    handleEditAppointment,
    handleEditClick,
    cancelAppointmentMutation
  };
};
