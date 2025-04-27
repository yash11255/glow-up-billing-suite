
import { createClient } from "@supabase/supabase-js";

// Use the Supabase URL and anon key
const supabaseUrl = "https://vcjdxuzgkfjztlivqhtp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjamR4dXpna2ZqenRsaXZxaHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTE2MjYsImV4cCI6MjA2MTIyNzYyNn0.ul3QQU89aurjB50-ziIXHr1hpwyd4PyXtJefSCx_VuQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  }
});

// Auth functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (err) {
    console.error("Sign in error:", err);
    return { data: null, error: err as Error };
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  } catch (err) {
    console.error("Sign up error:", err);
    return { data: null, error: err as Error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error("Sign out error:", err);
    return { error: err as Error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (err) {
    console.error("Get current user error:", err);
    return { user: null, error: err as Error };
  }
};

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (err) {
    console.error("Get session error:", err);
    return { session: null, error: err as Error };
  }
};

// Database helper functions
export const fetchUserData = async (table: string, userId?: string) => {
  try {
    if (!userId) {
      const { user } = await getCurrentUser();
      userId = user?.id;
    }
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error(`Error fetching ${table}:`, err);
    return { data: null, error: err as Error };
  }
};

// Get upcoming events (birthdays and anniversaries)
export const getUpcomingEvents = async (daysAhead = 30) => {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    // Get upcoming birthdays (assume birthday is stored as 'MM-DD')
    const { data: birthdayEvents, error: birthdayError } = await supabase
      .from('customers')
      .select('id, name, phone, birthday')
      .not('birthday', 'is', null)
      .eq('user_id', user.id);
      
    if (birthdayError) throw birthdayError;
    
    // Get upcoming anniversaries (assume anniversary is stored as 'MM-DD')
    const { data: anniversaryEvents, error: anniversaryError } = await supabase
      .from('customers')
      .select('id, name, phone, anniversary')
      .not('anniversary', 'is', null)
      .eq('user_id', user.id);
      
    if (anniversaryError) throw anniversaryError;
    
    // Process birthdays to find upcoming ones
    const upcomingBirthdays = birthdayEvents
      .filter(customer => customer.birthday)
      .map(customer => {
        const birthday = new Date(customer.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        
        // If the birthday has already occurred this year, look at next year's birthday
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: customer.id,
          customerId: customer.id,
          customerName: customer.name,
          phone: customer.phone,
          type: "birthday" as const,
          date: thisYearBirthday.toISOString(),
          daysUntil,
        };
      })
      .filter(event => event.daysUntil <= daysAhead)
      .sort((a, b) => a.daysUntil - b.daysUntil);
    
    // Process anniversaries to find upcoming ones
    const upcomingAnniversaries = anniversaryEvents
      .filter(customer => customer.anniversary)
      .map(customer => {
        const anniversary = new Date(customer.anniversary);
        const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
        
        // If the anniversary has already occurred this year, look at next year's anniversary
        if (thisYearAnniversary < today) {
          thisYearAnniversary.setFullYear(today.getFullYear() + 1);
        }
        
        const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: `anniv-${customer.id}`,
          customerId: customer.id,
          customerName: customer.name,
          phone: customer.phone,
          type: "anniversary" as const,
          date: thisYearAnniversary.toISOString(),
          daysUntil,
        };
      })
      .filter(event => event.daysUntil <= daysAhead)
      .sort((a, b) => a.daysUntil - b.daysUntil);
    
    // Combine and sort all events
    const allEvents = [...upcomingBirthdays, ...upcomingAnniversaries]
      .sort((a, b) => a.daysUntil - b.daysUntil);
    
    return { events: allEvents, error: null };
  } catch (err) {
    console.error("Error fetching upcoming events:", err);
    return { events: [], error: err as Error };
  }
};

// Get dashboard statistics
export const getDashboardStats = async (period: 'daily' | 'weekly' | 'monthly') => {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const today = new Date();
    let startDate = new Date();
    
    // Set the start date based on the period
    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(today.getMonth() - 1);
        break;
    }
    
    const startDateStr = startDate.toISOString();
    
    // Get bills for the period to calculate sales
    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: false });
      
    if (billsError) throw billsError;
    
    // Get customers created in the period
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('count')
      .eq('user_id', user.id)
      .gte('created_at', startDateStr);
      
    if (customersError) throw customersError;
    
    // Get services completed in the period
    const { data: billServices, error: servicesError } = await supabase
      .from('bill_services')
      .select('count')
      .eq('user_id', user.id)
      .gte('created_at', startDateStr);
      
    if (servicesError) throw servicesError;
    
    // Get products sold in the period
    const { data: billProducts, error: productsError } = await supabase
      .from('bill_products')
      .select('count, quantity')
      .eq('user_id', user.id)
      .gte('created_at', startDateStr);
      
    if (productsError) throw productsError;
    
    // Calculate total sales for the period
    const totalSales = bills ? bills.reduce((sum, bill) => sum + bill.total, 0) : 0;
    
    // Count total customers, services and products for the period
    const totalCustomers = customers ? parseInt(customers[0]?.count || "0") : 0;
    const totalServices = billServices ? parseInt(billServices[0]?.count || "0") : 0;
    const totalProducts = billProducts ? billProducts.reduce((sum, product) => sum + (product.quantity || 0), 0) : 0;
    
    // Get the most recent transactions
    const recentTransactions = bills ? bills.slice(0, 5).map(bill => ({
      id: bill.id,
      customer: bill.customer_name,
      amount: bill.total.toString(),
      status: bill.status,
      date: new Date(bill.created_at).toLocaleString(),
    })) : [];
    
    // Get upcoming events
    const { events: upcomingEvents } = await getUpcomingEvents(30);
    
    // Get staff performance data
    const { data: staffPerformance, error: staffError } = await supabase
      .from('bill_services')
      .select(`
        staff_id,
        staff_name,
        price
      `)
      .eq('user_id', user.id)
      .gte('created_at', startDateStr);
      
    if (staffError) throw staffError;
    
    // Process staff performance data
    const staffPerformanceMap = new Map();
    staffPerformance?.forEach(service => {
      if (!staffPerformanceMap.has(service.staff_id)) {
        staffPerformanceMap.set(service.staff_id, {
          id: service.staff_id,
          name: service.staff_name,
          servicesCompleted: 0,
          revenue: 0,
        });
      }
      
      const staff = staffPerformanceMap.get(service.staff_id);
      staff.servicesCompleted += 1;
      staff.revenue += service.price || 0;
    });
    
    const staffPerformanceArray = Array.from(staffPerformanceMap.values())
      .sort((a, b) => b.revenue - a.revenue);
    
    return {
      stats: {
        totalSales,
        totalCustomers,
        totalServices,
        totalProducts,
        recentTransactions,
        upcomingEvents,
        staffPerformance: staffPerformanceArray,
      },
      error: null
    };
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    return { 
      stats: {
        totalSales: 0,
        totalCustomers: 0,
        totalServices: 0,
        totalProducts: 0,
        recentTransactions: [],
        upcomingEvents: [],
        staffPerformance: [],
      }, 
      error: err as Error 
    };
  }
};
