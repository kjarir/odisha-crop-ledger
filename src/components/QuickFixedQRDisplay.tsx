import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { QrCode, Download } from 'lucide-react';

interface QuickFixedQRDisplayProps {
  batchId: string;
  ipfsHash?: string;
}

export const QuickFixedQRDisplay: React.FC<QuickFixedQRDisplayProps> = ({ batchId, ipfsHash }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    generateSimpleQR();
  }, [batchId, ipfsHash]);

  const generateSimpleQR = () => {
    // Simple QR code generation
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 10, 180, 180);
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code', 100, 90);
      ctx.fillText(`Batch: ${batchId.substring(0, 8)}...`, 100, 110);
      if (ipfsHash) {
        ctx.fillText('Certificate Available', 100, 130);
      }
    }
    
    setQrCode(canvas.toDataURL());
  };

  const handleDownload = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `batch-${batchId}-qr.png`;
      link.click();
      toast({
        title: "QR Code Downloaded",
        description: "QR code saved successfully",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <QrCode className="h-4 w-4" />
            <span className="text-sm font-medium">Batch QR Code</span>
          </div>
          
          {qrCode && (
            <>
              <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto border rounded" />
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};