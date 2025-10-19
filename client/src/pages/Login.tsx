import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Package, CreditCard } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "@/contexts/NewAuthContext";
import { Redirect } from "wouter";

export default function Login() {
  const { user, signIn } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-chart-2/10 px-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Branding Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-login-title">
              Senpai Network
            </h1>
            <p className="text-xl text-muted-foreground">
              Secure Digital Marketplace
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">List & Sell Products</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your digital products and reach buyers instantly
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="h-6 w-6 text-chart-2 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Secure UPI Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Pay safely with QR codes and transaction verification
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-chart-3 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Admin Verified</h3>
                <p className="text-sm text-muted-foreground">
                  All products and payments reviewed for safety
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in with your Google account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              size="lg"
              className="w-full text-lg"
              onClick={signIn}
              data-testid="button-google-signin"
            >
              <SiGoogle className="h-5 w-5 mr-2" />
              Continue with Google
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>By continuing, you agree to our Terms of Service</p>
              <p>and Privacy Policy</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
