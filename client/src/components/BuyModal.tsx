import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/NewAuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/newQueryClient";
import type { Product } from "@shared/schema";
import qrImage from "@assets/scan here_1760606417275.png";

interface MarketplaceConfig {
  upiId: string;
  qrImagePath: string;
  commissionRate: number;
  sellerRate: number;
}

interface BuyModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function BuyModal({ product, open, onClose }: BuyModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState("");

  const { data: marketplaceConfig, isLoading: configLoading, error: configError } = useQuery<MarketplaceConfig>({
    queryKey: ["/api/config/marketplace"],
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !user) return;

    // Ensure marketplace config is loaded before proceeding
    if (!marketplaceConfig) {
      toast({
        title: "Configuration error",
        description: "Unable to load marketplace settings. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          buyerId: user.id,
          buyerName: user.displayName,
          buyerEmail: user.email,
          sellerId: product.sellerId,
          transactionId,
          amount: Number(amount),
          sellerEarnings: Number(amount) * marketplaceConfig.sellerRate,
          marketplaceCommission: Number(amount) * marketplaceConfig.commissionRate,
        }),
      });

      toast({
        title: "Payment submitted!",
        description: "Your payment is pending admin verification. You'll get download access once verified.",
      });

      setTransactionId("");
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onClose();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl" data-testid="modal-buy">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Complete Purchase</DialogTitle>
          <DialogDescription>
            Scan the QR code to pay via UPI, then enter your transaction details below
          </DialogDescription>
        </DialogHeader>

        {configError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p className="font-semibold">Configuration Error</p>
            <p className="text-sm">Unable to load payment settings. Please try again or contact support.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-xl border-4 border-primary">
              <img 
                src={qrImage} 
                alt="UPI QR Code" 
                className="w-64 h-64 md:w-72 md:h-72"
                data-testid="img-qr-code"
              />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">UPI ID</p>
              {configLoading ? (
                <div className="h-6 w-48 mx-auto bg-muted animate-pulse rounded" />
              ) : (
                <p className="font-mono font-semibold" data-testid="text-upi-id">
                  {marketplaceConfig?.upiId || "Loading..."}
                </p>
              )}
            </div>
          </div>

          {/* Payment Details Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Product</p>
              <p className="font-semibold text-lg" data-testid="text-product-title">{product.title}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Amount to Pay</p>
              <p className="text-3xl font-bold text-primary" data-testid="text-product-price">
                ₹{product.price}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-id" className="text-base">Transaction ID / UTR *</Label>
              <Input
                id="transaction-id"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter 12-digit UTR number"
                className="font-mono"
                required
                minLength={12}
                maxLength={12}
                data-testid="input-transaction-id"
              />
              <p className="text-xs text-muted-foreground">
                Find this in your UPI app after payment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base">Amount Paid (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter ${product.price}`}
                required
                min={product.price}
                max={product.price}
                data-testid="input-amount"
              />
              <p className="text-xs text-muted-foreground">
                Must match the product price exactly
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Instructions:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Scan the QR code using any UPI app</li>
                <li>Pay exactly ₹{product.price}</li>
                <li>Copy the 12-digit transaction ID (UTR)</li>
                <li>Enter the details above and submit</li>
                <li>Admin will verify and grant download access</li>
              </ol>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={processing || configLoading || !marketplaceConfig || !!configError} 
                className="flex-1" 
                data-testid="button-submit-payment"
              >
                {processing ? "Processing..." : configLoading ? "Loading..." : "Submit Payment"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={processing} data-testid="button-cancel-buy">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
