import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthEventHandler } from "@/components/auth/AuthEventHandler";
import { SessionCheck } from "@/components/auth/SessionCheck";
import { AuthForm } from "@/components/auth/AuthForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary p-6 flex items-center justify-center">
      <AuthEventHandler />
      <SessionCheck />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to PM Batch Video Processor</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;