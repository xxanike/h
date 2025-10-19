import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/NewAuthContext";
import { useState } from "react";
import { UploadModal } from "@/components/UploadModal";

export function FloatingUploadButton() {
  const { user } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);

  // Only show for sellers and admins
  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return null;
  }

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group md:w-auto md:px-6 z-50"
        onClick={() => setUploadOpen(true)}
        data-testid="button-upload-floating"
      >
        <Plus className="h-6 w-6" />
        <span className="hidden md:inline md:ml-2 md:group-hover:inline">
          Upload Product
        </span>
      </Button>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
