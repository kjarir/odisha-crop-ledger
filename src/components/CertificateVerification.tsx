import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  FileText,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  verifyCertificate, 
  verifyCertificateFromIPFS, 
  verifyCertificateWithDatabaseFallback,
  generateVerificationReport,
  VerificationResult 
} from '@/utils/certificateVerification';
import { getIPFSFileUrl } from '@/utils/ipfs';

export const CertificateVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { provider } = useWeb3();
  const [verificationType, setVerificationType] = useState<'batchId' | 'ipfsHash'>('batchId');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  // Handle URL parameters
  useEffect(() => {
    const batchId = searchParams.get('batchId');
    const ipfsHash = searchParams.get('ipfsHash');
    
    if (batchId) {
      setVerificationType('batchId');
      setInputValue(batchId);
    } else if (ipfsHash) {
      setVerificationType('ipfsHash');
      setInputValue(ipfsHash);
    }
  }, [searchParams]);

  const handleVerify = async () => {
    if (!inputValue.trim()) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter a batch ID or IPFS hash to verify.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let verificationResult: VerificationResult;

      if (verificationType === 'batchId') {
        const batchId = parseInt(inputValue);
        if (isNaN(batchId)) {
          throw new Error('Invalid batch ID. Please enter a valid number.');
        }
        // Use database fallback verification
        verificationResult = await verifyCertificateWithDatabaseFallback(batchId, provider || undefined);
      } else {
        verificationResult = await verifyCertificateFromIPFS(inputValue, provider || undefined);
      }

      setResult(verificationResult);

      if (verificationResult.isValid) {
        toast({
          title: "Verification successful!",
          description: "Certificate is authentic and valid.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: "Certificate verification failed. Check the details below.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard.",
    });
  };

  const downloadReport = () => {
    if (!result) return;

    const report = generateVerificationReport(result);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification_report_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const openIPFSLink = (ipfsHash: string) => {
    const url = getIPFSFileUrl(ipfsHash);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
        <p className="text-muted-foreground">
          Verify the authenticity of agricultural certificates by checking blockchain and IPFS records
        </p>
      </div>

      {/* Verification Input */}
      <Card>
        <CardHeader>
          <CardTitle>Verify Certificate</CardTitle>
          <CardDescription>
            Enter either a batch ID or IPFS hash to verify certificate authenticity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button
              variant={verificationType === 'batchId' ? 'default' : 'outline'}
              onClick={() => setVerificationType('batchId')}
            >
              Batch ID
            </Button>
            <Button
              variant={verificationType === 'ipfsHash' ? 'default' : 'outline'}
              onClick={() => setVerificationType('ipfsHash')}
            >
              IPFS Hash
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification-input">
              {verificationType === 'batchId' ? 'Batch ID' : 'IPFS Hash'}
            </Label>
            <div className="flex space-x-2">
              <Input
                id="verification-input"
                placeholder={
                  verificationType === 'batchId' 
                    ? 'Enter batch ID (e.g., 123)' 
                    : 'Enter IPFS hash (e.g., QmXxXxXx...)'
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
              <Button onClick={handleVerify} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Verify
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {result.isValid ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <CardTitle>
                  {result.isValid ? 'Certificate Verified' : 'Verification Failed'}
                </CardTitle>
              </div>
              <Badge variant={result.isValid ? 'default' : 'destructive'}>
                {result.isValid ? 'Valid' : 'Invalid'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Batch Information */}
            {result.batchData && (
              <div>
                <h3 className="font-semibold mb-2">Batch Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Batch ID</Label>
                    <p className="text-sm">{result.batchData.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Crop Type</Label>
                    <p className="text-sm">{result.batchData.crop}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Variety</Label>
                    <p className="text-sm">{result.batchData.variety}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Harvest Quantity</Label>
                    <p className="text-sm">{result.batchData.harvestQuantity} kg</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Farmer</Label>
                    <p className="text-sm font-mono">{result.batchData.farmer}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Owner</Label>
                    <p className="text-sm font-mono">{result.batchData.currentOwner}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Price</Label>
                    <p className="text-sm">₹{result.batchData.price}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">IPFS Hash</Label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono">{result.batchData.ipfsHash}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(result.batchData!.ipfsHash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openIPFSLink(result.batchData!.ipfsHash)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Errors</h3>
                <div className="space-y-2">
                  {result.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-yellow-600">Warnings</h3>
                <div className="space-y-2">
                  {result.warnings.map((warning, index) => (
                    <Alert key={index} className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Details */}
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Verification Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Blockchain: {result.blockchainData ? 'Verified' : 'Not Found'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>IPFS: {result.ipfsData ? 'Verified' : 'Not Found'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Verified: {new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4">
              <Button onClick={downloadReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              {result.batchData?.ipfsHash && (
                <Button 
                  onClick={() => openIPFSLink(result.batchData!.ipfsHash)} 
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Blockchain Verification</h3>
            <p className="text-sm text-muted-foreground">
              Certificates are verified against immutable blockchain records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">IPFS Storage</h3>
            <p className="text-sm text-muted-foreground">
              Original certificates stored on decentralized IPFS network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Fraud Prevention</h3>
            <p className="text-sm text-muted-foreground">
              Detect fake certificates and ensure authenticity
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
