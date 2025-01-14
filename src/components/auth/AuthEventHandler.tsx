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
        console.log("Sign in successful, redirecting to home");
        navigate("/");
      }

      if (event === 'SIGNED_OUT') {
        console.log("Sign out successful");
      }

      // Handle specific OAuth errors
      if (event === 'INITIAL_SESSION' && !session) {
        // Check URL for error parameters
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          console.error("OAuth error:", error, errorDescription);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: errorDescription || "Failed to authenticate with Google. Please try again."
          });
        }
      }

      // Handle authentication errors
      if (event === 'SIGNED_IN' && !session) {
        const error = new AuthApiError("Authentication failed", 403);
        console.error("Authentication error details:", {
          event,
          session,
          error: error.message,
          status: error.status
        });
        
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to authenticate with Google. Please ensure you've granted the necessary permissions."
        });
      }
    });

    // Check for immediate auth errors on page load
    const checkAuthError = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session check error:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message
        });
      }
    };

    checkAuthError();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return null;
};