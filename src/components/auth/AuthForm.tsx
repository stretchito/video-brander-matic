import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export const AuthForm = () => {
  return (
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
          sign_in: {
            email_label: 'Email',
            password_label: 'Password',
            email_input_placeholder: 'Your email address',
            password_input_placeholder: 'Your password',
            button_label: 'Sign in',
            loading_button_label: 'Signing in ...',
            social_provider_text: 'Sign in with {{provider}}',
            link_text: 'Already have an account? Sign in',
          },
          sign_up: {
            email_label: 'Email',
            password_label: 'Password',
            email_input_placeholder: 'Your email address',
            password_input_placeholder: 'Your password',
            button_label: 'Sign up',
            loading_button_label: 'Signing up ...',
            social_provider_text: 'Sign up with {{provider}}',
            link_text: 'Don\'t have an account? Sign up',
            confirmation_text: 'Check your email for the confirmation link',
          },
        },
      }}
      view="sign_in"
      showLinks={true}
      redirectTo={window.location.origin}
    />
  );
};