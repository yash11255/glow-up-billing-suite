
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { DayView } from "@/components/appointments/DayView";
import { WeekView } from "@/components/appointments/WeekView";
import { useAppointments } from "@/hooks/useAppointments";

const Appointments = () => {
  const {
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
    isLoading,
    dayAppointments,
    weekAppointments,
    handleAddAppointment,
    handleEditAppointment,
    handleEditClick,
    cancelAppointmentMutation
  } = useAppointments();

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
              <Calendar
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
              onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}
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
              onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}
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
        ) : viewMode === "day" ? (
          <DayView
            selectedDate={selectedDate}
            appointments={dayAppointments || []}
            openAddDialog={openAddDialog}
            setOpenAddDialog={setOpenAddDialog}
            onAddAppointment={handleAddAppointment}
            onEditAppointment={handleEditClick}
            onCancelAppointment={(id) => cancelAppointmentMutation.mutate(id)}
          />
        ) : (
          <WeekView
            weekDays={weekDays}
            appointments={weekAppointments}
            onDayClick={(date) => {
              setSelectedDate(date);
              setOpenAddDialog(true);
            }}
            onAppointmentClick={handleEditClick}
          />
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
