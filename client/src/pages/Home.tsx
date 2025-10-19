import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search, Package, Shield, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { BuyModal } from "@/components/BuyModal";
import type { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const categories = ["All", "Documents", "Media", "Code", "Design", "Templates"];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", "approved"],
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleBuy = (product: Product) => {
    setSelectedProduct(product);
    setBuyModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-chart-2/10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-page-title">
              Senpai Network Marketplace
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Buy and sell digital products securely with UPI payments and admin verification
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover-elevate transition-all">
              <CardHeader>
                <Package className="h-12 w-12 mx-auto text-primary" />
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">List Products</h3>
                <p className="text-sm text-muted-foreground">
                  Upload and sell your digital creations
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate transition-all">
              <CardHeader>
                <CreditCard className="h-12 w-12 mx-auto text-chart-2" />
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Pay safely via UPI with QR codes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate transition-all">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto text-chart-3" />
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">Admin Verified</h3>
                <p className="text-sm text-muted-foreground">
                  All products reviewed before listing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="space-y-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover-elevate transition-all"
                onClick={() => setSelectedCategory(category)}
                data-testid={`badge-category-${category.toLowerCase()}`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover-elevate transition-all hover:shadow-md group"
                data-testid={`card-product-${product.id}`}
              >
                <Link href={`/product/${product.id}`}>
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={product.thumbnailURL}
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                    <Badge className="absolute top-2 right-2 bg-chart-3 text-white">
                      Approved
                    </Badge>
                  </div>
                </Link>
                <CardHeader className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-1" data-testid={`text-title-${product.id}`}>
                    {product.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
                    ₹{product.price}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {product.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleBuy(product)}
                    data-testid={`button-buy-${product.id}`}
                  >
                    Buy Now
                  </Button>
                  <Link href={`/product/${product.id}`}>
                    <Button variant="outline" data-testid={`button-view-${product.id}`}>
                      View
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Be the first to upload a product!"}
            </p>
          </div>
        )}
      </div>

      <BuyModal
        product={selectedProduct}
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
      />
    </div>
  );
}
