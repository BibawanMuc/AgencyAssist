import { supabase } from '../config/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  uid: string;
  email: string | null;
  displayName?: string;
  photoURL?: string;
}



/**
 * Helper to map Supabase user to our internal User interface
 */
function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    uid: supabaseUser.id,
    email: supabaseUser.email || null,
    displayName: supabaseUser.user_metadata?.full_name || undefined,
    photoURL: supabaseUser.user_metadata?.avatar_url || undefined
  };
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error.message));
  }

  if (!data.user) {
    throw new Error('Benutzer konnte nicht erstellt werden');
  }

  // TODO: Create user profile in Database if needed
  // For now we rely on Auth metadata if any

  return mapSupabaseUser(data.user);
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error.message));
  }

  if (!data.user) {
    throw new Error('Anmeldung fehlgeschlagen');
  }

  return mapSupabaseUser(data.user);
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error('Abmelden fehlgeschlagen');
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return mapSupabaseUser(user);
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback(mapSupabaseUser(session.user));
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Update user password
 */
export async function updateUserPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw new Error(getAuthErrorMessage(error.message));
  }
}

/**
 * Update user metadata (display name, avatar)
 */
export async function updateUserMetadata(updates: { displayName?: string; photoURL?: string }): Promise<void> {
  const data: any = {};
  if (updates.displayName) data.full_name = updates.displayName;
  if (updates.photoURL) data.avatar_url = updates.photoURL;

  const { error } = await supabase.auth.updateUser({
    data
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error.message));
  }
}

/**
 * Send password reset email to the user
 */
export async function resetPassword(email: string): Promise<void> {
  // Use production URL for redirect, fallback to current origin for local dev
  const appUrl = (import.meta as any).env.VITE_APP_URL;
  const redirectUrl = appUrl
    ? `${appUrl}/reset-password`
    : `${window.location.origin}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error.message));
  }
}

/**
 * Update password using the reset token from email link
 * This should be called on the reset password page after user clicks email link
 */
export async function updatePasswordWithToken(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error.message));
  }
}


/**
 * Convert Supabase/General Auth error codes to user-friendly messages
 */
function getAuthErrorMessage(errorMessage: string): string {
  // Supabase often returns English messages, we try to match them
  const lowerMsg = errorMessage.toLowerCase();

  if (lowerMsg.includes('invalid login credentials')) {
    return 'Falsche E-Mail-Adresse oder Passwort';
  }
  if (lowerMsg.includes('email not confirmed')) {
    return 'Bitte bestätigen Sie Ihre E-Mail-Adresse';
  }
  if (lowerMsg.includes('user already registered')) {
    return 'Diese E-Mail-Adresse wird bereits verwendet';
  }
  if (lowerMsg.includes('too many requests')) {
    return 'Zu viele Anfragen. Bitte versuchen Sie es später erneut';
  }
  if (lowerMsg.includes('password') && lowerMsg.includes('weak')) {
    return 'Das Passwort ist zu schwach. Bitte verwenden Sie mindestens 6 Zeichen';
  }

  // Default fallback
  return errorMessage || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut';
}

