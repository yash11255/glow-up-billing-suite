
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useInventory = (selectedCompany: string) => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

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

  return {
    inventory,
    services,
    categories,
    companies,
    fetchInventory,
    fetchInventoryByCompany,
  };
};
