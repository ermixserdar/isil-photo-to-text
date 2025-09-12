import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onFileUpload: (files: File[]) => void;
  uploadedFiles: File[];
  onRemoveFile: (index: number) => void;
  isProcessing: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileUpload,
  uploadedFiles,
  onRemoveFile,
  isProcessing,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
      onFileUpload(imageFiles);
      setIsDragOver(false);
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true,
    disabled: isProcessing,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-border bg-gradient-subtle p-8 text-center cursor-pointer transition-smooth hover:border-primary/50",
          isDragActive && "border-primary bg-primary/5",
          isDragOver && "border-primary bg-primary/10",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <Upload 
            className={cn(
              "w-12 h-12 text-muted-foreground transition-smooth",
              isDragActive && "text-primary animate-pulse"
            )} 
          />
          <div>
            <p className="text-lg font-medium">
              {isDragActive 
                ? "Dosyaları buraya bırakın..." 
                : "Fotoğraflarınızı buraya sürükleyin"
              }
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              veya <Button variant="link" className="p-0 h-auto">dosya seçin</Button>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Desteklenen formatlar: JPG, PNG, GIF, BMP, WebP
            </p>
          </div>
        </div>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Yüklenen Dosyalar ({uploadedFiles.length})</h3>
          <div className="grid gap-2">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(index);
                  }}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};