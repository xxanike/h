import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Download, Clock, Shield, FileText } from "lucide-react";
import { useAuth } from "@/contexts/NewAuthContext";
import { apiRequest, queryClient } from "@/lib/newQueryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, Order, AdminLog } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Redirect } from "wouter";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: pendingProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products/pending"],
  });

  const { data: pendingPayments, isLoading: paymentsLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders/pending"],
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery<AdminLog[]>({
    queryKey: ["/api/admin/logs"],
  });

  const approveProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to approve product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      toast({ title: "Product approved", description: "Product is now visible in the marketplace" });
    },
  });

  const rejectProductMutation = useMutation({
    mutationFn: async ({ productId, reason }: { productId: string; reason: string }) => {
      const response = await fetch(`/api/admin/products/${productId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error("Failed to reject product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      toast({ title: "Product rejected", description: "Seller has been notified" });
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/admin/orders/${orderId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to verify payment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      toast({ title: "Payment verified", description: "Buyer can now download the product" });
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to reject payment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      toast({ title: "Payment rejected", variant: "destructive" });
    },
  });

  const downloadFileMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/admin/products/${productId}/download`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to get download URL");
      return response.json() as Promise<{ downloadURL: string }>;
    },
    onSuccess: (data) => {
      window.open(data.downloadURL, "_blank");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
    },
  });

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "approve_product":
        return <Badge className="bg-chart-3 text-white">Approved Product</Badge>;
      case "reject_product":
        return <Badge variant="destructive">Rejected Product</Badge>;
      case "verify_payment":
        return <Badge className="bg-chart-3 text-white">Verified Payment</Badge>;
      case "reject_payment":
        return <Badge variant="destructive">Rejected Payment</Badge>;
      case "download_file":
        return <Badge variant="outline">Downloaded File</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-page-title">
          Admin Panel
        </h1>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products" data-testid="tab-products">
            Pending Approvals
            {pendingProducts && pendingProducts.length > 0 && (
              <Badge className="ml-2" variant="secondary">{pendingProducts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">
            Payment Verification
            {pendingPayments && pendingPayments.length > 0 && (
              <Badge className="ml-2" variant="secondary">{pendingPayments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : pendingProducts && pendingProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingProducts.map((product) => (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnailURL}
                              alt={product.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={product.sellerPhotoURL} />
                              <AvatarFallback className="text-xs">
                                {product.sellerName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{product.sellerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">₹{product.price}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadFileMutation.mutate(product.id)}
                              data-testid={`button-download-${product.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveProductMutation.mutate(product.id)}
                              disabled={approveProductMutation.isPending}
                              data-testid={`button-approve-${product.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectProductMutation.mutate({ 
                                productId: product.id, 
                                reason: "Does not meet marketplace standards" 
                              })}
                              disabled={rejectProductMutation.isPending}
                              data-testid={`button-reject-${product.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending product approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Verification</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : pendingPayments && pendingPayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.map((order) => (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell className="font-medium">{order.productTitle}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{order.buyerName}</p>
                            <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {order.transactionId}
                          </code>
                        </TableCell>
                        <TableCell className="font-semibold">₹{order.amount}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => verifyPaymentMutation.mutate(order.id)}
                              disabled={verifyPaymentMutation.isPending}
                              data-testid={`button-verify-${order.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectPaymentMutation.mutate(order.id)}
                              disabled={rejectPaymentMutation.isPending}
                              data-testid={`button-reject-payment-${order.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending payment verifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Admin Action Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : auditLogs && auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-lg border hover-elevate transition-colors"
                      data-testid={`log-${log.id}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {log.adminName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.adminName}</span>
                          {getActionBadge(log.action)}
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No admin actions logged yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
