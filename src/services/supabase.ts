
import { createClient } from "@supabase/supabase-js";

// We'll use the direct Supabase URL and anon key since we're in a frontend-only app
const supabaseUrl = "https://vcjdxuzgkfjztlivqhtp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjamR4dXpna2ZqenRsaXZxaHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTE2MjYsImV4cCI6MjA2MTIyNzYyNn0.ul3QQU89aurjB50-ziIXHr1hpwyd4PyXtJefSCx_VuQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};
