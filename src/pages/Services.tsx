
import { useState } from "react";
import { ServiceForm } from "@/components/services/ServiceForm";
import { ServiceList, Service } from "@/components/services/ServiceList";
import { Button } from "@/components/ui/button";

const Services = () => {
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Haircut & Styling",
      price: 850,
      duration: 60,
      description: "Professional haircut with styling",
    },
    {
      id: "2",
      name: "Hair Color",
      price: 1800,
      duration: 120,
      description: "Premium hair color with global application",
    },
    {
      id: "3",
      name: "Facial",
      price: 1200,
      duration: 45,
      description: "Rejuvenating facial treatment",
    },
    {
      id: "4",
      name: "Manicure",
      price: 600,
      duration: 30,
      description: "Nail care and polish application",
    },
  ]);

  const handleAddService = (serviceData: {
    name: string;
    price: number;
    duration: number;
    description: string;
  }) => {
    const newService: Service = {
      id: `service-${Date.now()}`,
      ...serviceData,
    };
    setServices([...services, newService]);
    setIsAddingService(false);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
  };

  const handleUpdateService = (serviceData: {
    name: string;
    price: number;
    duration: number;
    description: string;
  }) => {
    if (!editingService) return;

    const updatedServices = services.map((service) =>
      service.id === editingService.id
        ? { ...service, ...serviceData }
        : service
    );
    setServices(updatedServices);
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter((service) => service.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 animate-fade-in">
          Services
        </h1>
        <p className="text-muted-foreground animate-fade-in animate-delay-100">
          Manage your salon services
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 animate-fade-in animate-delay-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Service List</h2>
            {!isAddingService && !editingService && (
              <Button onClick={() => setIsAddingService(true)}>
                Add Service
              </Button>
            )}
          </div>
          <ServiceList
            services={services}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
          />
        </div>

        <div className="animate-fade-in animate-delay-300">
          {isAddingService && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Add New Service</h2>
              <ServiceForm
                onSubmit={handleAddService}
                buttonText="Add Service"
              />
              <Button
                variant="outline"
                onClick={() => setIsAddingService(false)}
                className="mt-4"
              >
                Cancel
              </Button>
            </div>
          )}

          {editingService && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Edit Service</h2>
              <ServiceForm
                initialData={{
                  name: editingService.name,
                  price: editingService.price,
                  duration: editingService.duration,
                  description: editingService.description,
                }}
                onSubmit={handleUpdateService}
                buttonText="Update Service"
              />
              <Button
                variant="outline"
                onClick={() => setEditingService(null)}
                className="mt-4"
              >
                Cancel
              </Button>
            </div>
          )}

          {!isAddingService && !editingService && (
            <div className="bg-muted/40 rounded-xl p-6">
              <h3 className="font-medium mb-3">Service Tips</h3>
              <ul className="space-y-2 text-sm">
                <li>• Create categories for your services for better organization</li>
                <li>• Set realistic service durations to manage appointments better</li>
                <li>• Update prices periodically based on costs and market rates</li>
                <li>• Add detailed descriptions to help your staff and customers</li>
                <li>• Consider adding service bundles or packages as services</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;
