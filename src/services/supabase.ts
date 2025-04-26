
import { createClient } from "@supabase/supabase-js";

// Use the Supabase URL and anon key
const supabaseUrl = "https://vcjdxuzgkfjztlivqhtp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjamR4dXpna2ZqenRsaXZxaHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTE2MjYsImV4cCI6MjA2MTIyNzYyNn0.ul3QQU89aurjB50-ziIXHr1hpwyd4PyXtJefSCx_VuQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
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
