
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ServiceFormProps {
  onSubmit: (service: { name: string; price: number; duration: number; description: string }) => void;
  initialData?: {
    name: string;
    price: number;
    duration: number;
    description: string;
  };
  buttonText?: string;
}

export const ServiceForm = ({ 
  onSubmit, 
  initialData = { name: "", price: 0, duration: 30, description: "" },
  buttonText = "Add Service"
}: ServiceFormProps) => {
  const [name, setName] = useState(initialData.name);
  const [price, setPrice] = useState(initialData.price);
  const [duration, setDuration] = useState(initialData.duration);
  const [description, setDescription] = useState(initialData.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      price,
      duration,
      description,
    });
    
    // Reset form if it's a new service
    if (!initialData.name) {
      setName("");
      setPrice(0);
      setDuration(30);
      setDescription("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Service Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Price (₹)
        </label>
        <input
          id="price"
          type="number"
          min="0"
          step="1"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
          className="mt-1 block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="duration" className="block text-sm font-medium">
          Duration (minutes)
        </label>
        <input
          id="duration"
          type="number"
          min="5"
          step="5"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
          className="mt-1 block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
        />
      </div>
      <Button type="submit">{buttonText}</Button>
    </form>
  );
};
