
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Product, Company, Service } from "@/types";

export const useInventory = (selectedCompany: string) => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
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
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock, category_id, company_id, user_id, companies:company_id(id, name)")
        .eq("user_id", user.id);
      
      if (error) throw error;
      setInventory(data as Product[] || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchInventoryByCompany = async (companyId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock, category_id, company_id, user_id, companies:company_id(id, name)")
        .eq("user_id", user.id)
        .eq("company_id", companyId);
        
      if (error) throw error;
      setInventory(data as Product[] || []);
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
      setServices(data as Service[] || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchServicesByCompany = async (companyId: string) => {
    if (!user) return;
    try {
      // The error indicates that 'company_id' column doesn't exist in the services table
      // Let's modify our approach - we'll fetch all services for the user
      // and handle company filtering in the frontend if needed
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price, duration, description, user_id")
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      // Since we can't filter by company_id at the database level,
      // we'll just return all services
      setServices(data as Service[] || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchCategories = async () => {
    if (!user) return;
    try {
      interface CategoryRecord {
        id: string;
        name: string;
        user_id: string;
      }
      
      const { data, error } = await supabase
        .from("product_categories")
        .select("id, name, user_id")
        .eq("user_id", user.id);
      if (error) throw error;

      const uniqueCategories = [
        ...new Set((data as CategoryRecord[] || []).map((item) => item.name)),
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
      setCompanies(data as Company[] || []);
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
