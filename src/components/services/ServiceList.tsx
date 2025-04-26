
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export const ServiceList = ({ services, onEdit, onDelete }: ServiceListProps) => {
  return (
    <div className="space-y-4">
      {services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No services added yet</p>
        </div>
      ) : (
        services.map((service) => (
          <div
            key={service.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{service.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {service.duration} mins
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{service.price}</p>
              </div>
            </div>
            {service.description && (
              <p className="text-sm mt-2">{service.description}</p>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(service)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(service.id)}
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
