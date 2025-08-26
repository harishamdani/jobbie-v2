import { createClient } from './supabase-client';
import type { LoginInput, SignupInput } from './validations/auth';

export class AuthService {
  private supabase = createClient();

  async signUp(credentials: SignupInput) {
    const { data, error } = await this.supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await this.supabase.from('profiles').insert({
        id: data.user.id,
        email: credentials.email,
        full_name: credentials.fullName,
      });

      if (profileError && profileError.code !== '23505') {
        console.warn('Profile creation error:', profileError);
      }
    }

    return data;
  }

  async signIn(credentials: LoginInput) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  async getUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  onAuthStateChange(callback: (session: import('@supabase/supabase-js').Session | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session);
    });
  }
}

export const authService = new AuthService();