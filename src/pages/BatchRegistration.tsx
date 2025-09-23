import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Upload, 
  Plus, 
  Camera, 
  FileImage, 
  Calendar, 
  Package, 
  MapPin,
  Star,
  Loader2,
  Check,
  QrCode,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export const BatchRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [batchRegistered, setBatchRegistered] = useState(false);
  
  const [formData, setFormData] = useState({
    cropType: '',
    variety: '',
    harvestQuantity: '',
    sowingDate: '',
    harvestDate: '',
    freshnessDuration: '',
    grading: '',
    certification: '',
    labTest: '',
    pricePerKg: '',
    farmLocation: ''
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Crop details and dates' },
    { id: 2, title: 'Quality & Pricing', description: 'Grading and pricing info' },
    { id: 3, title: 'Image Upload', description: 'Photos and documentation' },
    { id: 4, title: 'AI Analysis', description: 'Quality assessment' },
    { id: 5, title: 'Review & Submit', description: 'Final confirmation' }
  ];

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedImages(prev => [...prev, ...files]);
  };

  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAiAnalysis({
        qualityScore: 92,
        grade: 'A+',
        defects: ['Minor surface scratches', 'Optimal ripeness'],
        shelfLife: 14,
        suggestedPrice: 45,
        confidence: 94
      });
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  const submitBatch = () => {
    // Simulate blockchain registration
    setTimeout(() => {
      setBatchRegistered(true);
    }, 2000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type *</Label>
                <Select value={formData.cropType} onValueChange={(value) => setFormData({...formData, cropType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="maize">Maize</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="variety">Variety *</Label>
                <Input 
                  id="variety"
                  placeholder="e.g., Basmati, Wheat-302"
                  value={formData.variety}
                  onChange={(e) => setFormData({...formData, variety: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="harvestQuantity">Harvest Quantity (kg) *</Label>
                <Input 
                  id="harvestQuantity"
                  type="number"
                  placeholder="Enter quantity in kg"
                  value={formData.harvestQuantity}
                  onChange={(e) => setFormData({...formData, harvestQuantity: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="farmLocation">Farm Location *</Label>
                <Input 
                  id="farmLocation"
                  placeholder="District, State"
                  value={formData.farmLocation}
                  onChange={(e) => setFormData({...formData, farmLocation: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sowingDate">Sowing Date *</Label>
                <Input 
                  id="sowingDate"
                  type="date"
                  value={formData.sowingDate}
                  onChange={(e) => setFormData({...formData, sowingDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date *</Label>
                <Input 
                  id="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grading">Initial Grading</Label>
                <Select value={formData.grading} onValueChange={(value) => setFormData({...formData, grading: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">Grade A+</SelectItem>
                    <SelectItem value="A">Grade A</SelectItem>
                    <SelectItem value="B+">Grade B+</SelectItem>
                    <SelectItem value="B">Grade B</SelectItem>
                    <SelectItem value="C">Grade C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="certification">Certifications</Label>
                <Select value={formData.certification} onValueChange={(value) => setFormData({...formData, certification: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select certification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organic">Organic Certified</SelectItem>
                    <SelectItem value="fair-trade">Fair Trade</SelectItem>
                    <SelectItem value="non-gmo">Non-GMO</SelectItem>
                    <SelectItem value="conventional">Conventional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="freshnessDuration">Freshness Duration (days)</Label>
                <Input 
                  id="freshnessDuration"
                  type="number"
                  placeholder="Expected shelf life"
                  value={formData.freshnessDuration}
                  onChange={(e) => setFormData({...formData, freshnessDuration: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pricePerKg">Price per kg (₹)</Label>
                <Input 
                  id="pricePerKg"
                  type="number"
                  placeholder="Set your price"
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="labTest">Lab Test Results (Optional)</Label>
              <Textarea 
                id="labTest"
                placeholder="Enter any lab test results or quality certificates"
                value={formData.labTest}
                onChange={(e) => setFormData({...formData, labTest: e.target.value})}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Upload Crop Images</h3>
              <p className="text-muted-foreground mb-6">
                Upload high-quality images for AI analysis and documentation
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium">Upload Images</p>
                    <p className="text-sm text-muted-foreground">
                      Click to select multiple images
                    </p>
                  </label>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-dashed border-muted-foreground/25">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium">Take Photos</p>
                  <p className="text-sm text-muted-foreground">
                    Use camera to capture images
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Open Camera
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {uploadedImages.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Uploaded Images ({uploadedImages.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Badge variant="secondary" className="absolute top-1 right-1 text-xs">
                        {Math.round(file.size / 1024)}KB
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">AI Quality Analysis</h3>
              <p className="text-muted-foreground mb-6">
                Our AI will analyze your crop images to provide quality insights
              </p>
            </div>
            
            {!isAnalyzing && !analysisComplete && (
              <Card className="text-center">
                <CardContent className="py-8">
                  <FileImage className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-semibold mb-2">Ready for Analysis</h4>
                  <p className="text-muted-foreground mb-4">
                    Click the button below to start AI quality assessment
                  </p>
                  <Button onClick={runAIAnalysis} className="gradient-primary">
                    <Star className="h-4 w-4 mr-2" />
                    Start AI Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {isAnalyzing && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                  <h4 className="font-semibold mb-2">Analyzing Images...</h4>
                  <p className="text-muted-foreground mb-4">
                    AI is processing your crop images for quality assessment
                  </p>
                  <Progress value={33} className="max-w-md mx-auto" />
                </CardContent>
              </Card>
            )}
            
            {analysisComplete && aiAnalysis && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Check className="h-5 w-5 mr-2 text-green-600" />
                      Analysis Complete
                    </CardTitle>
                    <Badge variant="outline">
                      Confidence: {aiAnalysis.confidence}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold mb-1">Quality Score</h4>
                        <p className="text-2xl font-bold text-green-600">{aiAnalysis.qualityScore}/100</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold mb-1">Recommended Grade</h4>
                        <p className="text-2xl font-bold text-blue-600">{aiAnalysis.grade}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold mb-1">Shelf Life</h4>
                        <p className="text-2xl font-bold text-orange-600">{aiAnalysis.shelfLife} days</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Suggested Price</h4>
                    <p className="text-lg">₹{aiAnalysis.suggestedPrice}/kg based on quality analysis</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Analysis Notes</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.defects.map((note, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full mr-2"></div>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {!batchRegistered ? (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
                  <p className="text-muted-foreground">
                    Please review all information before registering on blockchain
                  </p>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Batch Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><strong>Crop:</strong> {formData.cropType} - {formData.variety}</div>
                      <div><strong>Quantity:</strong> {formData.harvestQuantity} kg</div>
                      <div><strong>Location:</strong> {formData.farmLocation}</div>
                      <div><strong>Harvest Date:</strong> {formData.harvestDate}</div>
                      <div><strong>Grade:</strong> {aiAnalysis?.grade || formData.grading}</div>
                      <div><strong>Price:</strong> ₹{formData.pricePerKg}/kg</div>
                    </div>
                    
                    {aiAnalysis && (
                      <div className="pt-4 border-t">
                        <h5 className="font-medium mb-2">AI Analysis Summary</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>Quality Score: <strong>{aiAnalysis.qualityScore}/100</strong></div>
                          <div>Recommended Grade: <strong>{aiAnalysis.grade}</strong></div>
                          <div>Shelf Life: <strong>{aiAnalysis.shelfLife} days</strong></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <h5 className="font-medium mb-2">Blockchain Registration</h5>
                    <p className="text-sm text-muted-foreground">
                      This batch will be registered on the blockchain for permanent traceability. 
                      Transaction fees may apply.
                    </p>
                  </CardContent>
                </Card>
                
                <Button onClick={submitBatch} className="w-full gradient-primary" size="lg">
                  <Package className="h-4 w-4 mr-2" />
                  Register Batch on Blockchain
                </Button>
              </>
            ) : (
              <Card className="text-center">
                <CardContent className="py-8">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Batch Registered Successfully!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your batch has been registered on the blockchain with ID: <strong>BAT-2024-002</strong>
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline">
                      <QrCode className="h-4 w-4 mr-2" />
                      View QR Code
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Register New Batch</h1>
          <p className="text-white/80">Create blockchain-verified certificates for your produce</p>
        </div>

        {/* Progress Steps */}
        <Card className="govt-card shadow-large mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${step.id <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}>
                    {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      h-1 w-12 mx-2
                      ${step.id < currentStep ? 'bg-primary' : 'bg-muted'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-semibold">{steps[currentStep - 1]?.title}</h3>
              <p className="text-sm text-muted-foreground">{steps[currentStep - 1]?.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="govt-card shadow-large">
          <CardContent className="p-6">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1 || batchRegistered}
              >
                Previous
              </Button>
              
              {currentStep < 5 && (
                <Button 
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  className="gradient-primary"
                  disabled={(currentStep === 3 && uploadedImages.length === 0) || 
                           (currentStep === 4 && !analysisComplete)}
                >
                  Next
                </Button>
              )}
              
              {currentStep === 5 && batchRegistered && (
                <Button onClick={() => window.location.href = '/dashboard'}>
                  Go to Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};