import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
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

    // Listen for auth changes with detailed error logging
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
        const error = new AuthApiError({
          message: 'Authentication failed',
          status: 403,
          name: 'AuthApiError'
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary p-6 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to PM Batch Video Processor</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#1EAEDB',
                    brandAccent: '#187C9D',
                  },
                },
              },
              className: {
                container: 'auth-container',
                label: 'auth-label',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            providers={["google"]}
            localization={{
              variables: {
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign up',
                  loading_button_label: 'Signing up ...',
                  link_text: 'Don\'t have an account? Sign up',
                  confirmation_text: 'Check your email for the confirmation link',
                },
              },
            }}
            view="sign_in"
            showLinks={true}
            redirectTo={window.location.origin}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;