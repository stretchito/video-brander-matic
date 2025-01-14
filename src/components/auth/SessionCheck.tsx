import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const SessionCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error.message
          });
          return;
        }
        if (session) {
          navigate("/");
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkUser();
  }, [navigate, toast]);

  return null;
};