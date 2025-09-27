import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  QrCode, 
  Download, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { 
  generateQRCodeDataURL, 
  generateBatchVerificationQR, 
  generateCertificateQR,
  downloadQRCode,
  QRCodeData 
} from '@/utils/qrCodeUtils';

interface FixedQRCodeDisplayProps {
  batchId: string;
  cropType: string;
  variety: string;
  harvestDate: string;
  farmerId: string;
  blockchainHash?: string;
  ipfsHash?: string;
  className?: string;
}

export const FixedQRCodeDisplay: React.FC<FixedQRCodeDisplayProps> = ({
  batchId,
  cropType,
  variety,
  harvestDate,
  farmerId,
  blockchainHash,
  ipfsHash,
  className = ""
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [verificationQR, setVerificationQR] = useState<string>('');
  const [certificateQR, setCertificateQR] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'batch' | 'verification' | 'certificate'>('certificate');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateQRCodes();
  }, [batchId, cropType, variety, harvestDate, farmerId, blockchainHash, ipfsHash]);

  const generateQRCodes = async () => {
    try {
      setLoading(true);

      // Generate batch data QR code
      const batchData: QRCodeData = {
        batchId,
        cropType,
        variety,
        harvestDate,
        farmerId,
        blockchainHash,
        ipfsHash,
        verificationUrl: `${window.location.origin}/verify?batchId=${batchId}`
      };

      const [batchQR, verificationQRCode, certificateQRCode] = await Promise.all([
        Promise.resolve(generateQRCodeDataURL(batchData)),
        generateBatchVerificationQR(batchId),
        ipfsHash ? generateCertificateQR(ipfsHash) : Promise.resolve('')
      ]);

      setQrCodeDataURL(batchQR);
      setVerificationQR(verificationQRCode);
      setCertificateQR(certificateQRCode);
    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR codes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type: 'batch' | 'verification' | 'certificate') => {
    try {
      let dataURL = '';
      let filename = '';

      switch (type) {
        case 'batch':
          dataURL = qrCodeDataURL;
          filename = `batch-${batchId}-qr.png`;
          break;
        case 'verification':
          dataURL = verificationQR;
          filename = `batch-${batchId}-verification-qr.png`;
          break;
        case 'certificate':
          dataURL = certificateQR;
          filename = `batch-${batchId}-certificate-qr.png`;
          break;
      }

      if (dataURL) {
        downloadQRCode(dataURL, filename);
        toast({
          title: "Download Started",
          description: `QR code saved as ${filename}`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download QR code",
      });
    }
  };

  const handleCopyLink = (type: 'verification' | 'certificate') => {
    try {
      let url = '';
      
      switch (type) {
        case 'verification':
          url = `${window.location.origin}/verify?batchId=${batchId}`;
          break;
        case 'certificate':
          url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
          break;
      }

      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link Copied",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy link",
      });
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Generating QR codes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Codes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <img
            src={activeTab === 'batch' ? qrCodeDataURL : activeTab === 'verification' ? verificationQR : certificateQR}
            alt={`QR Code for ${activeTab}`}
            className="w-48 h-48 border rounded-lg mx-auto"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => handleDownload(activeTab)} variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};