import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthApiError } from "@supabase/supabase-js";

export const AuthEventHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event);
      console.log("Session state:", session);
      console.log("Full auth state:", { event, session });
      
      if (event === 'SIGNED_IN' && session) {
        console.log("Sign in successful");
        navigate("/");
      }
      if (event === 'SIGNED_OUT') {
        console.log("Sign out successful");
      }
      if (event === 'USER_UPDATED') {
        console.log("User updated");
      }
      if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery initiated");
      }

      // Handle authentication errors
      if (event === 'SIGNED_IN' && !session) {
        const error = new AuthApiError("Authentication failed", 403, "Failed to authenticate with Google");
        console.error("Authentication error:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to authenticate with Google. Please try again."
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return null;
};