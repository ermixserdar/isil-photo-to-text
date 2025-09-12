import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { FileDown, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Tesseract from 'tesseract.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

interface OCRResult {
  text: string;
  confidence: number;
  fileName: string;
}

interface OCRProcessorProps {
  files: File[];
  onClearFiles: () => void;
}

export const OCRProcessor: React.FC<OCRProcessorProps> = ({ files, onClearFiles }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<OCRResult[]>([]);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const processOCR = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    
    const newResults: OCRResult[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file.name);
        
        const result = await Tesseract.recognize(
          file,
          'tur+eng', // Turkish and English support
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                const fileProgress = (i / files.length) * 100 + (m.progress * 100 / files.length);
                setProgress(Math.round(fileProgress));
              }
            }
          }
        );
        
        newResults.push({
          text: result.data.text,
          confidence: result.data.confidence,
          fileName: file.name
        });
      }
      
      setResults(newResults);
      toast({
        title: "OCR Tamamlandı",
        description: `${files.length} dosya başarıyla işlendi.`,
        variant: "default",
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Hata",
        description: "OCR işlemi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentFile("");
    }
  }, [files]);

  const copyToClipboard = async () => {
    const allText = results.map(result => 
      `=== ${result.fileName} ===\n${result.text}`
    ).join('\n\n');
    
    try {
      await navigator.clipboard.writeText(allText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Kopyalandı",
        description: "Metin panoya kopyalandı.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Metin kopyalanamadı.",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    const data = results.map(result => ({
      'Dosya Adı': result.fileName,
      'Güven Skoru': `${result.confidence.toFixed(1)}%`,
      'Metin': result.text
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'OCR Sonuçları');
    XLSX.writeFile(wb, 'IŞIL_OCR_Sonuçları.xlsx');
    
    toast({
      title: "Excel Dosyası İndirildi",
      description: "OCR sonuçları Excel formatında kaydedildi.",
    });
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    pdf.setFont('helvetica');
    
    // Turkish character support
    let yPosition = 20;
    
    results.forEach((result, index) => {
      if (index > 0) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(16);
      pdf.text(`Dosya: ${result.fileName}`, 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Güven Skoru: ${result.confidence.toFixed(1)}%`, 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(result.text, 170);
      pdf.text(lines, 20, yPosition);
    });
    
    pdf.save('IŞIL_OCR_Sonuçları.pdf');
    
    toast({
      title: "PDF Dosyası İndirildi",
      description: "OCR sonuçları PDF formatında kaydedildi.",
    });
  };

  const exportToWord = async () => {
    const paragraphs: Paragraph[] = [];
    
    results.forEach((result, index) => {
      // Add file name as heading
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Dosya: ${result.fileName}`,
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );
      
      // Add confidence score
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Güven Skoru: ${result.confidence.toFixed(1)}%`,
              italics: true,
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        })
      );
      
      // Add OCR text
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: result.text,
              size: 22,
            }),
          ],
          spacing: { after: 400 },
        })
      );
      
      // Add separator if not last item
      if (index < results.length - 1) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "────────────────────────────────────────",
                color: "CCCCCC",
              }),
            ],
            spacing: { after: 400 },
          })
        );
      }
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "IŞIL OCR Sonuçları",
                  bold: true,
                  size: 48,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 400 },
            }),
            ...paragraphs,
          ],
        },
      ],
    });

    try {
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'IŞIL_OCR_Sonuçları.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Word Dosyası İndirildi",
        description: "OCR sonuçları Word formatında kaydedildi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Word dosyası oluşturulamadı.",
        variant: "destructive",
      });
    }
  };

  const combinedText = results.map(result => result.text).join('\n\n');

  return (
    <div className="space-y-6">
      {files.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">OCR İşlemi</h2>
            <div className="flex gap-2">
              <Button
                onClick={processOCR}
                disabled={isProcessing}
                variant="gradient"
              >
                {isProcessing ? "İşleniyor..." : "OCR Başlat"}
              </Button>
              <Button
                onClick={onClearFiles}
                variant="outline"
                disabled={isProcessing}
              >
                Temizle
              </Button>
            </div>
          </div>
          
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>İşleniyor: {currentFile}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </Card>
      )}

      {results.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">OCR Sonuçları</h2>
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Kopyalandı" : "Kopyala"}
              </Button>
              <Button
                onClick={exportToExcel}
                variant="outline"
                size="sm"
              >
                <FileDown className="w-4 h-4" />
                Excel
              </Button>
              <Button
                onClick={exportToPDF}
                variant="outline"
                size="sm"
              >
                <FileDown className="w-4 h-4" />
                PDF
              </Button>
              <Button
                onClick={exportToWord}
                variant="outline"
                size="sm"
              >
                <FileDown className="w-4 h-4" />
                Word
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {results.map((result, index) => (
              <Card key={index} className="p-4 bg-gradient-subtle">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-sm">{result.fileName}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Güven: {result.confidence.toFixed(1)}%
                  </span>
                </div>
                <Textarea
                  value={result.text}
                  readOnly
                  className="min-h-[100px] resize-none"
                  placeholder="OCR sonucu burada görünecek..."
                />
              </Card>
            ))}
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Birleştirilmiş Metin</label>
            <Textarea
              value={combinedText}
              readOnly
              className="min-h-[200px] resize-none"
              placeholder="Tüm OCR sonuçları burada birleştirilmiş olarak görünecek..."
            />
          </div>
        </Card>
      )}
    </div>
  );
};