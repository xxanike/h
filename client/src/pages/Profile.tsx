import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, DollarSign, Clock, CheckCircle, XCircle, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Product, Order } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadModal } from "@/components/UploadModal";

export default function Profile() {
  const { user } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: myProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/my"],
  });

  const { data: myOrders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/my"],
  });

  const approvedProducts = myProducts?.filter(p => p.status === "approved").length || 0;
  const pendingProducts = myProducts?.filter(p => p.status === "pending").length || 0;
  const totalEarnings = myOrders
    ?.filter(o => o.status === "verified")
    .reduce((sum, o) => sum + o.sellerEarnings, 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-chart-3 text-white"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge className="bg-chart-5 text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-page-title">
          Seller Dashboard
        </h1>
        <Button onClick={() => setUploadOpen(true)} data-testid="button-upload">
          <Package className="h-4 w-4 mr-2" />
          Upload Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-products">
              {myProducts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {approvedProducts} approved, {pendingProducts} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-products">
              {pendingProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3" data-testid="text-total-earnings">
              ₹{totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              70% of sales (verified orders)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products" data-testid="tab-products">My Products</TabsTrigger>
          <TabsTrigger value="earnings" data-testid="tab-earnings">Earnings</TabsTrigger>
          <TabsTrigger value="payouts" data-testid="tab-payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : myProducts && myProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myProducts.map((product) => (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" data-testid={`button-view-${product.id}`}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No products uploaded yet</p>
                  <Button onClick={() => setUploadOpen(true)} className="mt-4" data-testid="button-upload-empty">
                    Upload Your First Product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : myOrders && myOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Your Earnings (70%)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.productTitle}</TableCell>
                        <TableCell>{order.buyerName}</TableCell>
                        <TableCell>₹{order.amount}</TableCell>
                        <TableCell className="font-semibold text-chart-3">
                          ₹{order.sellerEarnings.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {order.status === "verified" ? (
                            <Badge className="bg-chart-3 text-white">Verified</Badge>
                          ) : (
                            <Badge className="bg-chart-5 text-white">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No earnings yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Payouts are processed manually by the admin via UPI
                </p>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-chart-3">₹{totalEarnings.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total verified earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
