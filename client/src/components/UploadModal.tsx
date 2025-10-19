import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/NewAuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/newQueryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    tags: [] as string[],
    tagInput: "",
  });
  
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file for the thumbnail",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Thumbnail must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Product file must be less than 100MB",
          variant: "destructive",
        });
        return;
      }
      setProductFile(file);
    }
  };

  const addTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag], tagInput: "" });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!thumbnail || !productFile) {
      toast({
        title: "Missing files",
        description: "Please upload both thumbnail and product file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("price", formData.price);
      uploadFormData.append("tags", JSON.stringify(formData.tags));
      uploadFormData.append("thumbnail", thumbnail);
      uploadFormData.append("file", productFile);

      const response = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast({
        title: "Product uploaded!",
        description: "Your product is pending admin approval",
      });

      // Reset form
      setFormData({ title: "", description: "", price: "", tags: [], tagInput: "" });
      setThumbnail(null);
      setProductFile(null);
      setThumbnailPreview("");
      
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onClose();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-upload">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Upload Product</DialogTitle>
          <DialogDescription>
            Share your digital product with the marketplace. Admin approval required.
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-muted/50 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            By uploading, you consent that administrators may access your files for verification purposes.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter product title"
              required
              data-testid="input-product-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product..."
              className="min-h-32"
              required
              data-testid="input-product-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              type="number"
              min="1"
              step="1"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Enter price in rupees"
              required
              data-testid="input-product-price"
            />
            <p className="text-xs text-muted-foreground">
              You'll receive 70% (₹{formData.price ? Math.floor(Number(formData.price) * 0.7) : 0}). Marketplace fee: 30%
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={formData.tagInput}
                onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tags (press Enter)"
                data-testid="input-product-tag"
              />
              <Button type="button" onClick={addTag} variant="outline" data-testid="button-add-tag">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1" data-testid={`badge-tag-${tag}`}>
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover-elevate transition-colors">
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                data-testid="input-thumbnail"
              />
              <label htmlFor="thumbnail" className="cursor-pointer">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload thumbnail (max 5MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Product File *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover-elevate transition-colors">
              <input
                id="file"
                type="file"
                onChange={handleProductFileChange}
                className="hidden"
                data-testid="input-product-file"
              />
              <label htmlFor="file" className="cursor-pointer">
                {productFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{productFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(productFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload product file (max 100MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={uploading} className="flex-1" data-testid="button-submit-product">
              {uploading ? "Uploading..." : "Upload Product"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading} data-testid="button-cancel-upload">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
