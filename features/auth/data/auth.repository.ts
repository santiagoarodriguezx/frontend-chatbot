import type {
  AuthChangeEvent,
  AuthTokenResponsePassword,
  OAuthResponse,
  Session,
  Subscription,
  UserResponse,
} from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-browser";

type AuthStateChangeCallback = (
  event: AuthChangeEvent,
  session: Session | null,
) => void;

export const authRepository = {
  getSession() {
    return supabase.auth.getSession();
  },
  signInWithPassword(email: string, password: string): Promise<AuthTokenResponsePassword> {
    return supabase.auth.signInWithPassword({ email, password });
  },
  signUp(email: string, password: string): Promise<AuthTokenResponsePassword> {
    return supabase.auth.signUp({ email, password });
  },
  signInWithGoogle(redirectTo: string): Promise<OAuthResponse> {
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  },
  onAuthStateChange(callback: AuthStateChangeCallback): {
    data: { subscription: Subscription };
  } {
    return supabase.auth.onAuthStateChange(callback);
  },
  getUser(): Promise<UserResponse> {
    return supabase.auth.getUser();
  },
};
