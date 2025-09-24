import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Camera, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { parseQRCodeData, QRCodeData } from '@/utils/qrCodeUtils';
import { useNavigate } from 'react-router-dom';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: (data: QRCodeData) => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<QRCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setScannedData(null);
      setIsScanning(true);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      // Start scanning loop
      scanLoop();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const scanLoop = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR code detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple QR code detection (in a real app, you'd use a proper QR library)
    // For now, we'll simulate detection
    setTimeout(() => {
      if (isScanning) {
        scanLoop();
      }
    }, 100);
  };

  const handleManualInput = () => {
    const input = prompt('Enter QR code data or batch ID:');
    if (input) {
      processQRData(input);
    }
  };

  const processQRData = (data: string) => {
    try {
      // Check if it's a direct URL first
      if (data.startsWith('http')) {
        // Direct URL - open it
        window.open(data, '_blank');
        toast({
          title: "Opening Certificate",
          description: "Opening certificate in new tab...",
        });
        onClose();
        return;
      }

      // Try to parse as JSON first
      let qrData = parseQRCodeData(data);
      
      if (!qrData) {
        // If not JSON, treat as batch ID and try to find certificate
        handleBatchIdScan(data);
        return;
      }

      // If we have IPFS hash, open certificate directly
      if (qrData.ipfsHash) {
        const certificateUrl = `https://gateway.pinata.cloud/ipfs/${qrData.ipfsHash}`;
        window.open(certificateUrl, '_blank');
        toast({
          title: "Opening Certificate",
          description: `Opening certificate for ${qrData.cropType} - ${qrData.variety}`,
        });
        onClose();
        return;
      }

      // If we have verification URL, open it
      if (qrData.verificationUrl) {
        window.open(qrData.verificationUrl, '_blank');
        toast({
          title: "Opening Verification",
          description: `Opening verification for ${qrData.cropType} - ${qrData.variety}`,
        });
        onClose();
        return;
      }

      // Fallback to showing data
      setScannedData(qrData);
      setIsScanning(false);
      
      if (onScanSuccess) {
        onScanSuccess(qrData);
      }

      toast({
        title: "QR Code Scanned Successfully",
        description: `Batch ID: ${qrData.batchId}`,
      });
    } catch (error) {
      setError('Invalid QR code data');
      toast({
        variant: "destructive",
        title: "Invalid QR Code",
        description: "The scanned QR code contains invalid data.",
      });
    }
  };

  const handleBatchIdScan = async (batchId: string) => {
    try {
      // Try to find the batch in database to get certificate
      const response = await fetch(`/api/batches/${batchId}`);
      if (response.ok) {
        const batch = await response.json();
        if (batch.ipfs_hash || batch.ipfs_certificate_hash) {
          const certificateUrl = `https://gateway.pinata.cloud/ipfs/${batch.ipfs_hash || batch.ipfs_certificate_hash}`;
          window.open(certificateUrl, '_blank');
          toast({
            title: "Opening Certificate",
            description: `Opening certificate for ${batch.crop_type} - ${batch.variety}`,
          });
          onClose();
          return;
        }
      }
    } catch (error) {
      console.log('Could not fetch batch from API, trying verification page');
    }

    // Fallback to verification page
    const verificationUrl = `${window.location.origin}/verify?batchId=${batchId}`;
    window.open(verificationUrl, '_blank');
    toast({
      title: "Opening Verification",
      description: `Opening verification for batch ${batchId}`,
    });
    onClose();
  };

  const handleVerifyBatch = () => {
    if (scannedData) {
      navigate(`/verify?batchId=${scannedData.batchId}`);
      onClose();
    }
  };

  const handleViewCertificate = () => {
    if (scannedData?.ipfsHash) {
      window.open(`https://gateway.pinata.cloud/ipfs/${scannedData.ipfsHash}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Scanner
          </DialogTitle>
          <DialogDescription>
            Scan a QR code to verify batch information or view certificates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Camera View */}
          {isScanning && !scannedData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Camera View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover rounded-lg border"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <QrCode className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Position QR code here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Scanned Data Display */}
          {scannedData && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  QR Code Scanned Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Batch ID</p>
                    <p className="font-medium">{scannedData.batchId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Crop Type</p>
                    <p className="font-medium">{scannedData.cropType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Variety</p>
                    <p className="font-medium">{scannedData.variety}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Harvest Date</p>
                    <p className="font-medium">
                      {new Date(scannedData.harvestDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {scannedData.blockchainHash && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Blockchain Hash</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {scannedData.blockchainHash.substring(0, 20)}...
                    </Badge>
                  </div>
                )}

                {scannedData.ipfsHash && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">IPFS Hash</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {scannedData.ipfsHash.substring(0, 20)}...
                    </Badge>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleVerifyBatch} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Batch
                  </Button>
                  {scannedData.ipfsHash && (
                    <Button variant="outline" onClick={handleViewCertificate}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Certificate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual Input */}
          {!isScanning && !scannedData && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Having trouble scanning? Enter the data manually.
                  </p>
                  <Button variant="outline" onClick={handleManualInput}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Enter Manually
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {isScanning && (
              <Button variant="outline" onClick={stopScanning} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Stop Scanning
              </Button>
            )}
            {!isScanning && !scannedData && (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
