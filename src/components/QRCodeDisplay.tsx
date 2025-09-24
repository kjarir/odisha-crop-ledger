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

interface QRCodeDisplayProps {
  batchId: string;
  cropType: string;
  variety: string;
  harvestDate: string;
  farmerId: string;
  blockchainHash?: string;
  ipfsHash?: string;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
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
        generateQRCodeDataURL(batchData),
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

  const getCurrentQRCode = () => {
    switch (activeTab) {
      case 'batch':
        return qrCodeDataURL;
      case 'verification':
        return verificationQR;
      case 'certificate':
        return certificateQR;
      default:
        return qrCodeDataURL;
    }
  };

  const getCurrentFilename = () => {
    switch (activeTab) {
      case 'batch':
        return `batch-${batchId}-qr.png`;
      case 'verification':
        return `batch-${batchId}-verification-qr.png`;
      case 'certificate':
        return `batch-${batchId}-certificate-qr.png`;
      default:
        return `batch-${batchId}-qr.png`;
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
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {ipfsHash && (
            <button
              onClick={() => setActiveTab('certificate')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'certificate'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📄 Certificate
            </button>
          )}
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'verification'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✅ Verification
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'batch'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Batch Data
          </button>
        </div>

        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={getCurrentQRCode()}
              alt={`QR Code for ${activeTab}`}
              className="w-48 h-48 border rounded-lg"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                {activeTab}
              </Badge>
            </div>
          </div>
        </div>

        {/* QR Code Description */}
        <div className="text-center space-y-2">
          {activeTab === 'certificate' && (
            <div>
              <p className="text-sm font-medium text-green-600">📄 Certificate QR Code</p>
              <p className="text-xs text-gray-600">
                <strong>Scan to view PDF certificate directly!</strong> Opens the certificate in your browser.
              </p>
            </div>
          )}
          {activeTab === 'verification' && (
            <div>
              <p className="text-sm font-medium">✅ Verification Link</p>
              <p className="text-xs text-gray-600">
                Direct link to verify this batch on AgriTrace platform
              </p>
            </div>
          )}
          {activeTab === 'batch' && (
            <div>
              <p className="text-sm font-medium">📊 Complete Batch Information</p>
              <p className="text-xs text-gray-600">
                Contains all batch details including blockchain and IPFS hashes
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleDownload(activeTab)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          {(activeTab === 'verification' || activeTab === 'certificate') && (
            <Button
              onClick={() => handleCopyLink(activeTab)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          )}
          
          {activeTab === 'verification' && (
            <Button
              onClick={() => window.open(`${window.location.origin}/verify?batchId=${batchId}`, '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          
          {activeTab === 'certificate' && ipfsHash && (
            <Button
              onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Batch Info */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Batch ID:</span>
              <p className="font-mono">{batchId.substring(0, 12)}...</p>
            </div>
            <div>
              <span className="font-medium">Crop:</span>
              <p>{cropType} - {variety}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
