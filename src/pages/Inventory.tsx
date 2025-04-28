
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
import { Input } from "@/components/ui/input";
import { Package, Plus, Store, Search } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Inventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 0,
    unit: "",
    category: "",
    company_id: "",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [inventoryType, setInventoryType] = useState<"products" | "services">("products");
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    if (selectedCompany) {
      fetchInventoryByCompany(selectedCompany);
      fetchServicesByCompany(selectedCompany);
    } else {
      fetchInventory();
      fetchServices();
    }
    fetchCategories();
    fetchCompanies();
  }, [selectedCompany]);

  const fetchInventory = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, companies:company_id(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchInventoryByCompany = async (companyId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, companies:company_id(*)")
        .eq("user_id", user.id)
        .eq("company_id", companyId);
      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchServices = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchServicesByCompany = async (companyId: string) => {
    if (!user) return;
    try {
      // Assuming services are linked to companies. If not, you'll need to add that field
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)
        .eq("company_id", companyId);
      if (error) throw error;
      setServices(data || []);
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

  const fetchCompanies = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewItem({ ...newItem, [name]: value });
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...newItem, user_id: user.id }]);
      if (error) throw error;
      
      // Refresh inventory based on selected company
      if (selectedCompany) {
        fetchInventoryByCompany(selectedCompany);
      } else {
        fetchInventory();
      }
      
      setOpen(false); // Close dialog
      setNewItem({
        name: "",
        quantity: 0,
        unit: "",
        category: "",
        company_id: "",
      }); // Reset form
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
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-lg shadow-md p-4 flex flex-col justify-between"
                  >
                    <div>
                      <h2 className="text-lg font-semibold">{item.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        Company: {item.companies?.name || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Category: {item.category || "N/A"}
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-xl font-bold">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Price: ₹{item.price || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="services">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-card rounded-lg shadow-md p-4 flex flex-col justify-between"
                  >
                    <div>
                      <h2 className="text-lg font-semibold">{service.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        Duration: {service.duration} minutes
                      </p>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-xl font-bold">
                        ₹{service.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory.
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
              <Select onValueChange={(value) => handleSelectChange("category", value)}>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="company" className="text-right">
                Company
              </label>
              <Select onValueChange={(value) => handleSelectChange("company_id", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
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
