
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Product, Company } from "@/types";

export const useInventory = (selectedCompany: string) => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Product[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

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
      // Define the return type explicitly to avoid deep type instantiation
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock, category_id, company_id, user_id, companies:company_id(id, name)");
      
      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchInventoryByCompany = async (companyId: string) => {
    if (!user) return;
    try {
      // Define the return type explicitly to avoid deep type instantiation
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock, category_id, company_id, user_id, companies:company_id(id, name)")
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
        .select("id, name, price, duration, description, user_id")
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
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price, duration, description, user_id, company_id")
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
        .from("product_categories")
        .select("id, name, user_id")
        .eq("user_id", user.id);
      if (error) throw error;

      const uniqueCategories = [
        ...new Set(data?.map((item: {name: string}) => item.name)),
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
        .select("id, name, user_id")
        .eq("user_id", user.id);
      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    inventory,
    services,
    categories,
    companies,
    fetchInventory,
    fetchInventoryByCompany,
  };
};
