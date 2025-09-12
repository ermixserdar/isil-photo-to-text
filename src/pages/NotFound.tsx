import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-6 max-w-md">
        <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
          <FileText className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
          <p className="text-xl text-foreground mb-4">Sayfa bulunamadı</p>
          <p className="text-muted-foreground">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        <Button asChild variant="gradient">
          <a href="/">Ana Sayfaya Dön</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
