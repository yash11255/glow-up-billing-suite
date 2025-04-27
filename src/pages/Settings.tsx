
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getCurrentUser } from "@/services/supabase";
import { Switch } from "@/components/ui/switch";

// Define schemas for each settings type
const taxSettingsSchema = z.object({
  defaultTaxRate: z.number().min(0).max(100),
  enableTax: z.boolean(),
  taxName: z.string().min(1),
});

const discountSettingsSchema = z.object({
  defaultDiscountType: z.enum(["percentage", "amount"]),
  defaultDiscountValue: z.number().min(0),
  enableDiscount: z.boolean(),
});

const generalSettingsSchema = z.object({
  salonName: z.string().min(1),
  contactNumber: z.string().min(1),
  address: z.string().optional(),
  enableAppointmentReminders: z.boolean(),
  enableBirthdayWishes: z.boolean(),
});

type TaxSettings = z.infer<typeof taxSettingsSchema>;
type DiscountSettings = z.infer<typeof discountSettingsSchema>;
type GeneralSettings = z.infer<typeof generalSettingsSchema>;

// Define the settings database structure
interface Settings {
  id: string;
  user_id: string;
  tax_settings: TaxSettings;
  discount_settings: DiscountSettings;
  general_settings: GeneralSettings;
  created_at?: string;
  updated_at?: string;
}

const Settings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { user } = await getCurrentUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Fetch settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        toast.error("Error loading settings");
        throw error;
      }

      // If no settings exist, return default settings
      if (!data) {
        return {
          tax_settings: {
            defaultTaxRate: 18,
            enableTax: true,
            taxName: "GST",
          },
          discount_settings: {
            defaultDiscountType: "percentage",
            defaultDiscountValue: 0,
            enableDiscount: true,
          },
          general_settings: {
            salonName: "My Salon",
            contactNumber: "",
            address: "",
            enableAppointmentReminders: true,
            enableBirthdayWishes: true,
          },
        } as Settings;
      }
      
      return data;
    },
    enabled: !!userId
  });

  // Create or update settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      if (!userId) throw new Error("User not authenticated");

      // Check if settings already exist
      const { data: existingSettings, error: fetchError } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);
        
        if (error) throw error;
        return existingSettings.id;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('settings')
          .insert({
            user_id: userId,
            ...newSettings,
          })
          .select('id')
          .single();
        
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ['settings', userId] });
    },
    onError: (error) => {
      toast.error(`Error saving settings: ${error.message}`);
    }
  });

  // General Settings Form
  const generalForm = useForm<GeneralSettings>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings?.general_settings || {
      salonName: "My Salon",
      contactNumber: "",
      address: "",
      enableAppointmentReminders: true,
      enableBirthdayWishes: true,
    },
  });

  useEffect(() => {
    if (settings?.general_settings) {
      generalForm.reset(settings.general_settings);
    }
  }, [settings?.general_settings, generalForm]);

  function onGeneralSubmit(data: GeneralSettings) {
    saveSettingsMutation.mutate({ general_settings: data });
  }

  // Tax Settings Form
  const taxForm = useForm<TaxSettings>({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: settings?.tax_settings || {
      defaultTaxRate: 18,
      enableTax: true,
      taxName: "GST",
    },
  });

  useEffect(() => {
    if (settings?.tax_settings) {
      taxForm.reset(settings.tax_settings);
    }
  }, [settings?.tax_settings, taxForm]);

  function onTaxSubmit(data: TaxSettings) {
    saveSettingsMutation.mutate({ tax_settings: data });
  }

  // Discount Settings Form
  const discountForm = useForm<DiscountSettings>({
    resolver: zodResolver(discountSettingsSchema),
    defaultValues: settings?.discount_settings || {
      defaultDiscountType: "percentage",
      defaultDiscountValue: 0,
      enableDiscount: true,
    },
  });

  useEffect(() => {
    if (settings?.discount_settings) {
      discountForm.reset(settings.discount_settings);
    }
  }, [settings?.discount_settings, discountForm]);

  function onDiscountSubmit(data: DiscountSettings) {
    saveSettingsMutation.mutate({ discount_settings: data });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 animate-fade-in">
          Settings
        </h1>
        <p className="text-muted-foreground animate-fade-in animate-delay-100">
          Manage your salon settings
        </p>
      </div>

      <div className="animate-fade-in animate-delay-200">
        {isLoadingSettings ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading settings...</div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full md:w-1/2 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="tax">Tax</TabsTrigger>
              <TabsTrigger value="discount">Discounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Manage your salon's basic information and settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...generalForm}>
                    <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                      <FormField
                        control={generalForm.control}
                        name="salonName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salon Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter salon name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter salon address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator className="my-4" />
                      
                      <FormField
                        control={generalForm.control}
                        name="enableAppointmentReminders"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Appointment Reminders</FormLabel>
                              <FormDescription>Enable appointment reminders for customers</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="enableBirthdayWishes"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Birthday Wishes</FormLabel>
                              <FormDescription>Send birthday wishes to customers</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="mt-4" disabled={saveSettingsMutation.isPending}>
                        {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tax">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Settings</CardTitle>
                  <CardDescription>Configure tax settings for your salon</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...taxForm}>
                    <form onSubmit={taxForm.handleSubmit(onTaxSubmit)} className="space-y-6">
                      <FormField
                        control={taxForm.control}
                        name="enableTax"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Tax</FormLabel>
                              <FormDescription>Apply tax on bills</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={taxForm.control}
                        name="taxName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Name</FormLabel>
                            <FormControl>
                              <Input placeholder="GST, VAT, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={taxForm.control}
                        name="defaultTaxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="18" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="mt-4" disabled={saveSettingsMutation.isPending}>
                        {saveSettingsMutation.isPending ? "Saving..." : "Save Tax Settings"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="discount">
              <Card>
                <CardHeader>
                  <CardTitle>Discount Settings</CardTitle>
                  <CardDescription>Configure discount settings for your salon</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...discountForm}>
                    <form onSubmit={discountForm.handleSubmit(onDiscountSubmit)} className="space-y-6">
                      <FormField
                        control={discountForm.control}
                        name="enableDiscount"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Discounts</FormLabel>
                              <FormDescription>Apply discounts on bills</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={discountForm.control}
                        name="defaultDiscountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Discount Type</FormLabel>
                            <div className="flex space-x-4">
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <input
                                    type="radio"
                                    value="percentage"
                                    checked={field.value === "percentage"}
                                    onChange={() => field.onChange("percentage")}
                                    className="w-4 h-4"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Percentage (%)</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <input
                                    type="radio"
                                    value="amount"
                                    checked={field.value === "amount"}
                                    onChange={() => field.onChange("amount")}
                                    className="w-4 h-4"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Fixed Amount (₹)</FormLabel>
                              </FormItem>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={discountForm.control}
                        name="defaultDiscountValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Default Discount Value 
                              {discountForm.watch("defaultDiscountType") === "percentage" ? " (%)" : " (₹)"}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="mt-4" disabled={saveSettingsMutation.isPending}>
                        {saveSettingsMutation.isPending ? "Saving..." : "Save Discount Settings"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Settings;
