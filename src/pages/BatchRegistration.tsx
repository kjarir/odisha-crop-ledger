import { useState } from 'react';
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import { singleStepGroupManager } from '@/utils/singleStepGroupManager';
import { uploadBatchMetadataToIPFS } from '@/utils/ipfs';
import { BatchInput, CONTRACT_ADDRESS } from '@/contracts/config';
import AgriTraceABI from '@/contracts/AgriTrace.json';
import { 
  Package, 
  Calendar, 
  MapPin,
  DollarSign,
  Loader2,
  Wallet,
  FileText,
  Upload,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

export const BatchRegistration = () => {
  const { user } = useAuth();
  const { isConnected, connectWallet, account, provider } = useWeb3();
  const { registerBatch, getNextBatchId, loading: contractLoading } = useContract();
  const [formData, setFormData] = useState({
    cropType: '',
    variety: '',
    harvestQuantity: '',
    sowingDate: '',
    harvestDate: '',
    pricePerKg: '',
    certification: '',
    grading: 'Standard',
    labTest: '',
    freshnessDuration: '7'
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'uploading' | 'blockchain' | 'complete'>('form');
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [batchId, setBatchId] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to register a batch on the blockchain.",
      });
      return;
    }

    setLoading(true);
    setStep('uploading');

    try {
      // Step 1: Generate PDF certificate
      const batchData = {
        id: Math.floor(Date.now() / 1000), // Temporary ID for certificate
        farmer: account || '',
        crop: formData.cropType,
        variety: formData.variety,
        harvestQuantity: formData.harvestQuantity,
        sowingDate: formData.sowingDate,
        harvestDate: formData.harvestDate,
        freshnessDuration: formData.freshnessDuration,
        grading: formData.grading,
        certification: formData.certification || 'Standard',
        labTest: formData.labTest,
        price: parseFloat(formData.harvestQuantity) * parseFloat(formData.pricePerKg) * 100, // Convert to paise (multiply by 100)
        ipfsHash: '',
        languageDetected: 'en',
        summary: `Agricultural produce batch: ${formData.cropType} - ${formData.variety}`,
        callStatus: 'completed',
        offTopicCount: 0,
        currentOwner: account || '',
      };

      // Step 2: Generate harvest certificate and create group using SINGLE-STEP method
      const tempBatchId = Date.now(); // Temporary ID for file naming
      
      // Debug the data being passed
      console.log('🔍 DEBUG: BatchRegistration data:', {
        account: account,
        formData: formData,
        tempBatchId: tempBatchId.toString()
      });
      
      const harvestData = {
        batchId: tempBatchId.toString(),
        farmerName: account || 'Unknown Farmer',
        cropType: formData.cropType || 'Unknown Crop',
        variety: formData.variety || 'Unknown Variety',
        harvestQuantity: parseFloat(formData.harvestQuantity),
        harvestDate: formData.harvestDate,
        grading: formData.grading,
        certification: formData.certification,
        pricePerKg: parseFloat(formData.pricePerKg)
      };
      
      console.log('🔍 DEBUG: Harvest data being passed:', harvestData);
      
      const { pdfBlob, groupId, ipfsHash } = await singleStepGroupManager.uploadHarvestCertificate(harvestData);
      
      // Step 3: Upload batch metadata to IPFS
      const metadataIpfsHash = await uploadBatchMetadataToIPFS(batchData, tempBatchId);
      
      setIpfsHash(groupId); // Store group ID instead of individual IPFS hash
      
      // Store the certificate IPFS hash for later use
      const certificateIpfsHash = ipfsHash;
      setStep('blockchain');

      // Step 4: Register on blockchain
      const calculatedPrice = Math.floor(parseFloat(formData.harvestQuantity) * parseFloat(formData.pricePerKg) * 100);
      
      // Validate price is within reasonable bounds (max 1 billion paise = 10 million rupees)
      if (calculatedPrice > 1000000000) {
        throw new Error('Price too high. Please reduce quantity or price per kg.');
      }
      
      const batchInput: BatchInput = {
        crop: formData.cropType,
        variety: formData.variety,
        harvestQuantity: formData.harvestQuantity,
        sowingDate: formData.sowingDate,
        harvestDate: formData.harvestDate,
        freshnessDuration: formData.freshnessDuration,
        grading: formData.grading,
        certification: formData.certification || 'Standard',
        labTest: formData.labTest,
        price: calculatedPrice,
        ipfsHash: groupId,
        languageDetected: 'en',
        summary: `Agricultural produce batch: ${formData.cropType} - ${formData.variety}`,
        callStatus: 'completed',
        offTopicCount: 0,
      };

      const receipt = await registerBatch(batchInput);
      
      if (receipt) {
        console.log('Transaction receipt:', receipt);
        console.log('Event logs:', receipt.logs);
        
        // Extract batch ID from events - BatchRegistered event signature
        const batchRegisteredEventSignature = ethers.id('BatchRegistered(uint256,address,string,string,uint256)');
        console.log('Looking for event signature:', batchRegisteredEventSignature);
        console.log('All event logs:', receipt.logs.map((log: any) => ({
          address: log.address,
          topics: log.topics,
          data: log.data
        })));
        
        const batchRegisteredEvent = receipt.logs.find(
          (log: any) => log.topics[0] === batchRegisteredEventSignature
        );
        
        console.log('Found batch registered event:', batchRegisteredEvent);
        
        let extractedBatchId = null;
        if (batchRegisteredEvent) {
          extractedBatchId = parseInt(batchRegisteredEvent.topics[1], 16);
          setBatchId(extractedBatchId);
          
          // Update the batch data with the real batch ID
          batchData.id = extractedBatchId;
          batchData.ipfsHash = certificateIpfsHash;
        } else {
          // Try to decode events using contract interface
          try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AgriTraceABI.abi, provider);
            const decodedEvents = receipt.logs.map((log: any) => {
              try {
                return contract.interface.parseLog(log);
              } catch (e) {
                return null;
              }
            }).filter(Boolean);
            
            console.log('Decoded events:', decodedEvents);
            
            const batchRegisteredEvent = decodedEvents.find(
              (event: any) => event?.name === 'BatchRegistered'
            );
            
            if (batchRegisteredEvent) {
              extractedBatchId = Number(batchRegisteredEvent.args.batchId);
              setBatchId(extractedBatchId);
              batchData.id = extractedBatchId;
              batchData.ipfsHash = certificateIpfsHash;
              console.log('Found batch ID using contract interface:', extractedBatchId);
            } else {
              // Try alternative event signatures
              const alternativeSignatures = [
                ethers.id('BatchRegistered(uint256,address,string,string,uint256)'),
                ethers.id('BatchRegistered(uint256,address,string,string,uint256)'),
                // Try without indexed parameters
                ethers.id('BatchRegistered(uint256,address,string,string,uint256)')
              ];
              
              let foundEvent = null;
              for (const sig of alternativeSignatures) {
                foundEvent = receipt.logs.find((log: any) => log.topics[0] === sig);
                if (foundEvent) break;
              }
              
              if (foundEvent) {
                extractedBatchId = parseInt(foundEvent.topics[1], 16);
                setBatchId(extractedBatchId);
                batchData.id = extractedBatchId;
                batchData.ipfsHash = ipfsHash;
                console.log('Found batch ID using alternative signature:', extractedBatchId);
              } else {
                // Final fallback: use timestamp as temporary ID
                extractedBatchId = Math.floor(Date.now() / 1000);
                setBatchId(extractedBatchId);
                console.warn('Could not extract batch ID from any event, using timestamp as fallback');
                
                // Update the batch data with the fallback ID
                batchData.id = extractedBatchId;
                batchData.ipfsHash = ipfsHash;
              }
            }
          } catch (decodeError) {
            console.error('Error decoding events:', decodeError);
            // Final fallback: use timestamp as temporary ID
            extractedBatchId = Math.floor(Date.now() / 1000);
            setBatchId(extractedBatchId);
            console.warn('Could not decode events, using timestamp as fallback');
            
            // Update the batch data with the fallback ID
            batchData.id = extractedBatchId;
            batchData.ipfsHash = certificateIpfsHash;
          }
        }

        // Step 5: Save to Supabase for local reference
        try {
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

          if (profile) {
            // Only insert fields that exist in the current database schema
            const batchData = {
          farmer_id: profile.id,
          crop_type: formData.cropType,
          variety: formData.variety,
          harvest_quantity: parseFloat(formData.harvestQuantity),
          sowing_date: formData.sowingDate,
          harvest_date: formData.harvestDate,
          price_per_kg: parseFloat(formData.pricePerKg),
          total_price: parseFloat(formData.harvestQuantity) * parseFloat(formData.pricePerKg),
          grading: formData.grading,
              freshness_duration: parseInt(formData.freshnessDuration),
          certification: formData.certification || 'Standard',
          status: 'available',
          group_id: groupId // Store the group ID
            };

            console.log('Inserting batch data:', batchData);
            
            const { data: insertedBatch, error: insertError } = await (supabase as any)
              .from('batches')
              .insert(batchData)
        .select()
        .single();

            if (insertError) {
              console.error('Database insertion error:', insertError);
              throw new Error(`Database error: ${insertError.message}`);
            }

            console.log('Batch inserted successfully:', insertedBatch);
          }
        } catch (dbError) {
          console.warn('Failed to save to local database:', dbError);
          // Don't fail the entire process if local DB save fails
        }

        // Group-based system: Certificate is already created and uploaded to group
        console.log(`Batch registered with Group ID: ${groupId}`);

        setStep('complete');
      toast({
        title: "Batch registered successfully!",
          description: `Your batch has been registered with Group ID: ${groupId}`,
      });

      // Reset form
      setFormData({
        cropType: '',
        variety: '',
        harvestQuantity: '',
        sowingDate: '',
        harvestDate: '',
        pricePerKg: '',
        certification: '',
          grading: 'Standard',
          labTest: '',
          freshnessDuration: '7'
      });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Register New Batch</h1>
          <p className="text-muted-foreground">
            Register your agricultural produce on the blockchain for complete traceability
          </p>
        </div>

        {/* Wallet Connection Status */}
        {!isConnected && (
          <Alert className="mb-6">
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to register batches on the blockchain.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={connectWallet}
              >
                Connect Wallet
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Wallet className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Wallet connected: {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        {loading && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <div>
                  <h3 className="font-semibold">
                    {step === 'uploading' && 'Generating certificate and uploading to IPFS...'}
                    {step === 'blockchain' && 'Registering on blockchain...'}
                    {step === 'complete' && 'Registration complete!'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step === 'uploading' && 'Creating PDF certificate and uploading to decentralized storage'}
                    {step === 'blockchain' && 'Submitting transaction to blockchain network'}
                    {step === 'complete' && 'Your batch has been successfully registered'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {step === 'complete' && batchId && ipfsHash && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800">Batch Registration Successful!</h3>
                  <p className="text-sm text-green-700">
                    Your batch has been registered on the blockchain and stored on IPFS.
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Batch ID:</strong> {batchId}</p>
                    <p><strong>Group ID:</strong> {ipfsHash}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/verify?batchId=${batchId}`)}
                  >
                    Verify Certificate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setStep('form')}
                  >
                    Register Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="govt-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Batch Information
            </CardTitle>
            <CardDescription>
              Fill in the details about your agricultural produce batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type *</Label>
                  <Select 
                    value={formData.cropType} 
                    onValueChange={(value) => setFormData({...formData, cropType: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rice">Rice</SelectItem>
                      <SelectItem value="Wheat">Wheat</SelectItem>
                      <SelectItem value="Maize">Maize</SelectItem>
                      <SelectItem value="Turmeric">Turmeric</SelectItem>
                      <SelectItem value="Black Gram">Black Gram</SelectItem>
                      <SelectItem value="Green Chili">Green Chili</SelectItem>
                      <SelectItem value="Coconut">Coconut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variety">Variety *</Label>
                  <Input 
                    id="variety"
                    placeholder="e.g., Basmati, Pusa Basmati 1121"
                    value={formData.variety}
                    onChange={(e) => setFormData({...formData, variety: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="harvestQuantity">Harvest Quantity (kg) *</Label>
                  <Input 
                    id="harvestQuantity"
                    type="number"
                    min="1"
                    max="100000"
                    placeholder="e.g., 500"
                    value={formData.harvestQuantity}
                    onChange={(e) => setFormData({...formData, harvestQuantity: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pricePerKg">Price per Kg (₹) *</Label>
                  <Input
                    id="pricePerKg"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="10000"
                    placeholder="e.g., 25"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sowingDate">Sowing Date *</Label>
                  <Input 
                    id="sowingDate"
                    type="date"
                    value={formData.sowingDate}
                    onChange={(e) => setFormData({...formData, sowingDate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date *</Label>
                  <Input 
                    id="harvestDate"
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grading">Grading</Label>
                  <Select 
                    value={formData.grading} 
                    onValueChange={(value) => setFormData({...formData, grading: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grading" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certification">Certification</Label>
                  <Select 
                    value={formData.certification} 
                    onValueChange={(value) => setFormData({...formData, certification: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select certification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Organic">Organic</SelectItem>
                      <SelectItem value="Fair Trade">Fair Trade</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labTest">Lab Test Results</Label>
                  <Input 
                    id="labTest"
                    placeholder="e.g., Pesticide-free, Quality Grade A"
                    value={formData.labTest}
                    onChange={(e) => setFormData({...formData, labTest: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="freshnessDuration">Freshness Duration (days)</Label>
                  <Input 
                    id="freshnessDuration"
                    type="number"
                    placeholder="e.g., 7"
                    value={formData.freshnessDuration}
                    onChange={(e) => setFormData({...formData, freshnessDuration: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      cropType: '',
                      variety: '',
                      harvestQuantity: '',
                      sowingDate: '',
                      harvestDate: '',
                      pricePerKg: '',
                      certification: '',
                      grading: 'Standard',
                      labTest: '',
                      freshnessDuration: '7'
                    });
                    setStep('form');
                  }}
                >
                  Reset Form
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !isConnected} 
                  className="gradient-primary"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {!isConnected ? 'Connect Wallet First' : 
                   loading ? 'Registering...' : 'Register Batch on Blockchain'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="govt-card">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-primary mx-auto mb-4">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Blockchain Registry</h3>
              <p className="text-sm text-muted-foreground">
                Your batch will be recorded on an immutable blockchain ledger
              </p>
            </CardContent>
          </Card>

          <Card className="govt-card">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-secondary mx-auto mb-4">
                <FileText className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">PDF Certificate</h3>
              <p className="text-sm text-muted-foreground">
                Automatic generation of official certificates
              </p>
            </CardContent>
          </Card>

          <Card className="govt-card">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 mx-auto mb-4">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">IPFS Storage</h3>
              <p className="text-sm text-muted-foreground">
                Decentralized storage for certificates and metadata
              </p>
            </CardContent>
          </Card>

          <Card className="govt-card">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-accent to-accent-light mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Fair Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Get fair market prices with transparent pricing
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};