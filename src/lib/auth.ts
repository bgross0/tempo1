// src/lib/auth.ts
import { supabase } from './supabase';
import { User } from '@/types';

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName }
    }
  });
  
  if (error) throw error;
  
  // Create user record in users table
  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email!,
      display_name: displayName
    });
  }
  
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  if (error || !data) return null;
  
  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    settings: data.settings
  };
}