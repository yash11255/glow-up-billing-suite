import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Plus, Store } from "lucide-react";
import { toast } from "sonner";

const Inventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 0,
    unit: "",
    category: "",
  });
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  const fetchInventory = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchCategories = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("category")
        .eq("user_id", user.id);
      if (error) throw error;

      // Extract unique categories from the data
      const uniqueCategories = [
        ...new Set(data?.map((item: any) => item.category)),
      ];
      setCategories(uniqueCategories as string[]);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setNewItem({ ...newItem, category: value });
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("inventory")
        .insert([{ ...newItem, user_id: user.id }]);
      if (error) throw error;
      fetchInventory(); // Refresh inventory
      setOpen(false); // Close dialog
      setNewItem({ name: "", quantity: 0, unit: "", category: "" }); // Reset form
      toast.success("Item added successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-lg shadow-md p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Category: {item.category}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold">
                  {item.quantity} {item.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={newItem.name}
                onChange={handleInputChange}
                className="col-span-3 rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="quantity" className="text-right">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                value={newItem.quantity}
                onChange={handleInputChange}
                className="col-span-3 rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="unit" className="text-right">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                id="unit"
                value={newItem.unit}
                onChange={handleInputChange}
                className="col-span-3 rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right">
                Category
              </label>
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
