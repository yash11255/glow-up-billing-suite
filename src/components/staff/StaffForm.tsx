
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface StaffFormData {
  name: string;
  position: string;
  phone?: string;
  email?: string;
}

interface StaffFormProps {
  onSubmit: (staff: StaffFormData) => void;
  initialData?: StaffFormData;
}

export const StaffForm = ({
  onSubmit,
  initialData = { name: "", position: "", phone: "", email: "" },
}: StaffFormProps) => {
  const [staff, setStaff] = useState<StaffFormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof StaffFormData, string>> = {};
    let isValid = true;

    if (!staff.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!staff.position.trim()) {
      newErrors.position = "Position is required";
      isValid = false;
    }

    // Validate email format if provided
    if (staff.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staff.email)) {
      newErrors.email = "Valid email is required";
      isValid = false;
    }

    // Validate phone number if provided (basic validation)
    if (staff.phone && !/^\+?[0-9\s-]{6,}$/.test(staff.phone)) {
      newErrors.phone = "Valid phone number is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(staff);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStaff((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name as keyof StaffFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
          Staff Name *
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={staff.name}
          onChange={handleChange}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="position" className={errors.position ? "text-destructive" : ""}>
          Position *
        </Label>
        <Input
          id="position"
          name="position"
          type="text"
          value={staff.position}
          onChange={handleChange}
          className={errors.position ? "border-destructive" : ""}
        />
        {errors.position && <p className="text-sm text-destructive">{errors.position}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>
          Phone Number
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={staff.phone}
          onChange={handleChange}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={staff.email}
          onChange={handleChange}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>
      
      <Button type="submit" className="w-full">Save Staff Member</Button>
    </form>
  );
};
