import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { verificationSystem, VerificationResult, CertificateInfo } from '@/utils/verificationSystem';
import { 
  Search, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Package,
  Users,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  ExternalLink,
  QrCode,
  Hash
} from 'lucide-react';

export const ComprehensiveVerificationSystem: React.FC = () => {
  const [batchId, setBatchId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [batchResult, setBatchResult] = useState<VerificationResult | null>(null);
  const [groupResult, setGroupResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBatchVerification = async () => {
    if (!batchId.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a Batch ID"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await verificationSystem.verifyByBatchId(batchId.trim());
      setBatchResult(result);
      
      if (result.success) {
        toast({
          title: "Verification Successful",
          description: `Found ${result.certificates.length} certificates for batch ${batchId}`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.error || "Unknown error occurred"
        });
      }
    } catch (error) {
      console.error('Batch verification error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify batch"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGroupVerification = async () => {
    if (!groupId.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a Group ID"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await verificationSystem.verifyByGroupId(groupId.trim());
      setGroupResult(result);
      
      if (result.success) {
        toast({
          title: "Verification Successful",
          description: `Found group: ${result.groupName}`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.error || "Unknown error occurred"
        });
      }
    } catch (error) {
      console.error('Group verification error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify group"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (cid: string, fileName: string) => {
    setDownloading(cid);
    try {
      await verificationSystem.downloadCertificate(cid, fileName);
      toast({
        title: "Download Started",
        description: "Certificate download has started"
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download certificate"
      });
    } finally {
      setDownloading(null);
    }
  };

  const renderBatchInfo = (result: VerificationResult) => {
    if (!result.batchInfo) return null;

    const { batchInfo } = result;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Batch Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Farmer:</span>
                <span>{batchInfo.farmerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Crop:</span>
                <span>{batchInfo.cropType} - {batchInfo.variety}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Quantity:</span>
                <span>{batchInfo.harvestQuantity} kg</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Harvest Date:</span>
                <span>{new Date(batchInfo.harvestDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Grade:</span>
                <Badge variant="outline">{batchInfo.grading}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Price:</span>
                <span>₹{batchInfo.pricePerKg}/kg</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCertificates = (certificates: CertificateInfo[], title: string) => {
    if (certificates.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No certificates found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Certificates will appear here once they are uploaded to the group
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title} ({certificates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates.map((cert, index) => (
              <div key={cert.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={cert.type === 'harvest' ? 'default' : 'secondary'}>
                      {cert.type.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{cert.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCertificate(cert.cid, cert.name)}
                      disabled={downloading === cert.cid}
                    >
                      {downloading === cert.cid ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(verificationSystem.getCertificateUrl(cert.cid), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">CID:</span>
                    <p className="font-mono text-xs">{cert.cid}</p>
                  </div>
                  <div>
                    <span className="font-medium">Size:</span>
                    <p>{(cert.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <p>{new Date(cert.creationDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">File ID:</span>
                    <p className="font-mono text-xs">{cert.fileId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Supply Chain Verification</h1>
        <p className="text-muted-foreground">
          Verify agricultural products using either Batch ID or Group ID to view complete transaction history
        </p>
      </div>

      <Tabs defaultValue="batch" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Batch ID Verification
          </TabsTrigger>
          <TabsTrigger value="group" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Group ID Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verify by Batch ID</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the unique batch ID to view all certificates and transaction history
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="batchId">Batch ID</Label>
                  <Input
                    id="batchId"
                    placeholder="Enter batch ID (e.g., e5ff8c16-ceda-40c9-8cd0-2e70bf960609)"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBatchVerification()}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleBatchVerification} 
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
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

          {batchResult && (
            <>
              {batchResult.success ? (
                <>
                  {renderBatchInfo(batchResult)}
                  {renderCertificates(batchResult.certificates, "Batch Certificates")}
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Verification Failed</h3>
                      <p className="text-muted-foreground">{batchResult.error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="group" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verify by Group ID</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the Pinata group ID to directly access all certificates in the group
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="groupId">Group ID</Label>
                  <Input
                    id="groupId"
                    placeholder="Enter group ID (e.g., abbf96a2-ea5d-42a2-959e-ddb906e8b33d)"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGroupVerification()}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleGroupVerification} 
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
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

          {groupResult && (
            <>
              {groupResult.success ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Group Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Group ID:</span>
                          <code className="bg-muted px-2 py-1 rounded text-sm">{groupResult.groupId}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Group Name:</span>
                          <span>{groupResult.groupName}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {renderCertificates(groupResult.certificates, "Group Certificates")}
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Verification Failed</h3>
                      <p className="text-muted-foreground">{groupResult.error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
