import React, { useState, useEffect } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { OCRProcessor } from "@/components/OCRProcessor";
import { Card } from "@/components/ui/card";
import { FileText, Zap, Download } from "lucide-react";
import { registerServiceWorker, checkInstallPrompt, showIOSInstallInstructions, setupOfflineDetection } from "@/utils/pwa";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    // Initialize PWA features
    registerServiceWorker();
    checkInstallPrompt();
    showIOSInstallInstructions();
    setupOfflineDetection();
  }, []);

  const handleFileUpload = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearFiles = () => {
    setFiles([]);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                IŞIL
              </h1>
              <p className="text-sm text-muted-foreground">
                Fotoğraf OCR ve Dönüştürme Uygulaması
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Fotoğraflardan Metne Dönüştürme</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fotoğraflarınızdaki metinleri kolayca çıkarın ve Excel, Word veya PDF formatlarında kaydedin.
              Türkçe ve İngilizce destekli gelişmiş OCR teknolojisi.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center bg-gradient-subtle border-primary/20">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Gelişmiş OCR</h3>
              <p className="text-sm text-muted-foreground">
                Türkçe ve İngilizce metinleri yüksek doğrulukla tanır
              </p>
            </Card>
            
            <Card className="p-6 text-center bg-gradient-subtle border-primary/20">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Hızlı İşleme</h3>
              <p className="text-sm text-muted-foreground">
                Birden fazla dosyayı aynı anda işler
              </p>
            </Card>
            
            <Card className="p-6 text-center bg-gradient-subtle border-primary/20">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Çoklu Format</h3>
              <p className="text-sm text-muted-foreground">
                Excel, Word ve PDF formatlarında dışa aktar
              </p>
            </Card>
          </div>

          {/* File Upload Section */}
          <FileUploadZone
            onFileUpload={handleFileUpload}
            uploadedFiles={files}
            onRemoveFile={handleRemoveFile}
            isProcessing={false}
          />

          {/* OCR Processing Section */}
          <OCRProcessor
            files={files}
            onClearFiles={handleClearFiles}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>IŞIL OCR Uygulaması - Fotoğraflarınızdaki metinleri dijitalleştirin</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;