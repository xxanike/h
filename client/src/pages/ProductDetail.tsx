import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Home, Download, Shield } from "lucide-react";
import { BuyModal } from "@/components/BuyModal";
import type { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-home">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium" data-testid="text-product-breadcrumb">
          {product.title}
        </span>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Product Image */}
        <div className="lg:col-span-3">
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
            <img
              src={product.thumbnailURL}
              alt={product.title}
              className="object-cover w-full h-full"
              data-testid="img-product-main"
            />
            <Badge className="absolute top-4 right-4 bg-chart-3 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Admin Verified
            </Badge>
          </div>

          {/* Product Description */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-xl font-semibold">Description</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-product-description">
                {product.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-product-title">
              {product.title}
            </h1>
            <p className="text-4xl font-bold text-primary mb-6" data-testid="text-product-price">
              ₹{product.price}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag}`}>
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Buy Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={() => setBuyModalOpen(true)}
              data-testid="button-buy-now"
            >
              <Download className="h-5 w-5 mr-2" />
              Buy Now
            </Button>
          </div>

          <Separator />

          {/* Product Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Product Information</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Size</span>
                <span className="font-medium">
                  {(product.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Name</span>
                <span className="font-medium font-mono text-xs truncate max-w-[200px]">
                  {product.fileName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listed</span>
                <span className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Seller</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={product.sellerPhotoURL} alt={product.sellerName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {product.sellerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium" data-testid="text-seller-name">{product.sellerName}</p>
                  <p className="text-sm text-muted-foreground">Verified Seller</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">Earnings Distribution</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Seller receives (70%)</span>
                  <span className="font-semibold">₹{Math.floor(product.price * 0.7)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Marketplace fee (30%)</span>
                  <span className="font-semibold">₹{Math.floor(product.price * 0.3)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BuyModal
        product={product}
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
      />
    </div>
  );
}
