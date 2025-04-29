
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventory } from "@/hooks/useInventory";
import AddItemDialog from "@/components/inventory/AddItemDialog";
import InventoryList from "@/components/inventory/InventoryList";

const Inventory = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 0,
    unit: "",
    category: "",
    company_id: "",
  });
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [inventoryType, setInventoryType] = useState<"products" | "services">("products");

  const { inventory, services, categories, companies } = useInventory(selectedCompany);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewItem({ ...newItem, [name]: value });
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("products")
        .insert([{ ...newItem, user_id: user.id }]);
      if (error) throw error;
      
      setOpen(false);
      setNewItem({
        name: "",
        quantity: 0,
        unit: "",
        category: "",
        company_id: "",
      });
      toast.success("Item added successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Filter inventory based on search term
  const filteredInventory = inventory.filter((item) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter services based on search term
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="container mx-auto py-10">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Inventory</h1>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <Select 
              value={selectedCompany} 
              onValueChange={setSelectedCompany}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={inventoryType} onValueChange={(value) => setInventoryType(value as "products" | "services")}>
            <TabsList className="mb-4">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              <InventoryList items={filteredInventory} type="products" />
            </TabsContent>
            
            <TabsContent value="services">
              <InventoryList items={filteredServices} type="services" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AddItemDialog
        open={open}
        setOpen={setOpen}
        newItem={newItem}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        categories={categories}
        companies={companies}
      />
    </div>
  );
};

export default Inventory;
