import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/contexts/NewAuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    productApproval: true,
    paymentVerified: true,
    newOrders: true,
  });

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8" data-testid="text-page-title">
        Settings
      </h1>

      <div className="space-y-6">
        {/* Account Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Account</CardTitle>
            </div>
            <CardDescription>Your profile and account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user?.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold" data-testid="text-user-name">
                  {user?.displayName}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                  {user?.email}
                </p>
                <Badge className="mt-2" variant="outline" data-testid="badge-user-role">
                  {user?.role}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  data-testid="button-theme-toggle"
                >
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="product-approval">Product Approvals</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your products are approved or rejected
                  </p>
                </div>
                <Switch
                  id="product-approval"
                  checked={notifications.productApproval}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, productApproval: checked })
                  }
                  data-testid="switch-product-approval"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-verified">Payment Verified</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when payments are verified for your products
                  </p>
                </div>
                <Switch
                  id="payment-verified"
                  checked={notifications.paymentVerified}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, paymentVerified: checked })
                  }
                  data-testid="switch-payment-verified"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-orders">New Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone purchases your product
                  </p>
                </div>
                <Switch
                  id="new-orders"
                  checked={notifications.newOrders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newOrders: checked })
                  }
                  data-testid="switch-new-orders"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        {user?.role === "admin" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Role Management</CardTitle>
              </div>
              <CardDescription>Admin-only settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <p className="text-sm font-medium mb-2">Administrator Access</p>
                <p className="text-sm text-muted-foreground">
                  You have full access to the admin panel including product approvals,
                  payment verification, and audit logs.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logout Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Out</CardTitle>
            <CardDescription>Sign out of your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
