
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface CustomerFormData {
  name: string;
  phone: string;
  birthday?: string;
  anniversary?: string;
  notes?: string;
}

interface CustomerFormProps {
  onSubmit: (customer: CustomerFormData) => void;
  initialData?: CustomerFormData;
}

export const CustomerForm = ({
  onSubmit,
  initialData = { name: "", phone: "" },
}: CustomerFormProps) => {
  const [customer, setCustomer] = useState<CustomerFormData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(customer);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Customer Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={customer.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Phone Number *
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={customer.phone}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="birthday" className="block text-sm font-medium">
          Birthday
        </label>
        <input
          id="birthday"
          name="birthday"
          type="date"
          value={customer.birthday || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="anniversary" className="block text-sm font-medium">
          Anniversary
        </label>
        <input
          id="anniversary"
          name="anniversary"
          type="date"
          value={customer.anniversary || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={customer.notes || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
        />
      </div>
      <Button type="submit">Save Customer</Button>
    </form>
  );
};
