import jsPDF from 'jspdf';
import { Batch } from '@/contracts/config';

// Enhanced transaction interface for supply chain tracking
export interface SupplyChainTransaction {
  id: string;
  type: 'harvest' | 'purchase' | 'transfer' | 'processing' | 'retail';
  from: string;
  to: string;
  quantity: number;
  price: number;
  timestamp: string;
  location?: string;
  notes?: string;
}

// Enhanced batch data with transaction history
export interface EnhancedBatchData extends Batch {
  transactionHistory?: SupplyChainTransaction[];
  currentQuantity?: number;
  originalQuantity?: number;
}

// Certificate generation utility for AgriTrace
export const generatePDFCertificate = async (batchData: EnhancedBatchData): Promise<Blob> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = [45, 90, 45]; // Dark green
  const secondaryColor = [100, 150, 100]; // Light green
  const textColor = [50, 50, 50]; // Dark gray
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Logo and title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('🌿 AgriTrace', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Government of Odisha', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificate of Agricultural Traceability', pageWidth / 2, 35, { align: 'center' });
  
  // Certificate border
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.rect(15, 50, pageWidth - 30, pageHeight - 100);
  
  // Content
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = 70;
  const lineHeight = 8;
  
  // Basic batch information
  const fields = [
    { label: 'Batch ID', value: batchData.id ? batchData.id.toString() : 'N/A' },
    { label: 'Crop Type', value: batchData.crop || 'N/A' },
    { label: 'Variety', value: batchData.variety || 'N/A' },
    { label: 'Original Harvest Quantity', value: `${batchData.originalQuantity || batchData.harvestQuantity || 'N/A'} kg` },
    { label: 'Current Available Quantity', value: `${batchData.currentQuantity || batchData.harvestQuantity || 'N/A'} kg` },
    { label: 'Sowing Date', value: batchData.sowingDate ? new Date(batchData.sowingDate).toLocaleDateString() : 'N/A' },
    { label: 'Harvest Date', value: batchData.harvestDate ? new Date(batchData.harvestDate).toLocaleDateString() : 'N/A' },
    { label: 'Freshness Duration', value: `${batchData.freshnessDuration || 'N/A'} days` },
    { label: 'Grading', value: batchData.grading || 'N/A' },
    { label: 'Certification', value: batchData.certification || 'Standard' },
    { label: 'Current Market Price', value: batchData.price ? `₹${(batchData.price / 100).toFixed(2)}` : 'N/A' },
    { label: 'Current Owner', value: batchData.currentOwner ? `${batchData.currentOwner.substring(0, 6)}...${batchData.currentOwner.substring(batchData.currentOwner.length - 4)}` : 'N/A' },
    { label: 'Blockchain Hash', value: batchData.ipfsHash || 'N/A' },
  ];
  
  fields.forEach((field, index) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${field.label}:`, 25, yPosition);
    
    doc.setFont('helvetica', 'normal');
    const textWidth = doc.getTextWidth(field.value);
    if (textWidth > pageWidth - 100) {
      // Split long text
      const splitText = doc.splitTextToSize(field.value, pageWidth - 100);
      doc.text(splitText, 25, yPosition + 4);
      yPosition += lineHeight * splitText.length;
    } else {
      doc.text(field.value, 25, yPosition + 4);
      yPosition += lineHeight;
    }
    
    yPosition += 5;
  });

  // Add supply chain transaction history if available
  if (batchData.transactionHistory && batchData.transactionHistory.length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 120) {
      doc.addPage();
      yPosition = 30;
    }

    yPosition += 10;
    
    // Supply Chain History Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('Supply Chain Transaction History', 25, yPosition);
    yPosition += 8;

    // Draw line under header
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(25, yPosition, pageWidth - 25, yPosition);
    yPosition += 8;

    // Transaction details
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    
    batchData.transactionHistory.forEach((transaction, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 30;
      }

      // Transaction type and date
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${transaction.type.toUpperCase()}`, 25, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(transaction.timestamp).toLocaleDateString(), pageWidth - 60, yPosition);
      yPosition += 5;

      // Transaction details
      doc.setFontSize(9);
      doc.text(`From: ${transaction.from}`, 30, yPosition);
      yPosition += 4;
      doc.text(`To: ${transaction.to}`, 30, yPosition);
      yPosition += 4;
      doc.text(`Quantity: ${transaction.quantity} kg`, 30, yPosition);
      yPosition += 4;
      doc.text(`Price: ₹${(transaction.price / 100).toFixed(2)}`, 30, yPosition);
      yPosition += 4;
      
      if (transaction.location) {
        doc.text(`Location: ${transaction.location}`, 30, yPosition);
        yPosition += 4;
      }
      
      if (transaction.notes) {
        doc.text(`Notes: ${transaction.notes}`, 30, yPosition);
        yPosition += 4;
      }

      yPosition += 6;
    });
  }
  
  // Footer
  doc.setFillColor(...secondaryColor);
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Issued by Government of Odisha Agricultural Department', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('This certificate verifies the authenticity and traceability of the agricultural produce.', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Generate blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

export const downloadPDFCertificate = async (batchData: Batch) => {
  try {
    const pdfBlob = await generatePDFCertificate(batchData);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgriTrace_Certificate_${batchData.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return pdfBlob;
  } catch (error) {
    console.error('Error generating PDF certificate:', error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const generateCertificate = async (batchData: any) => {
  // Convert legacy format to new format
  const batch: Batch = {
    id: batchData.id || 0,
    farmer: batchData.farmer || '',
    crop: batchData.crop_type || batchData.crop || '',
    variety: batchData.variety || '',
    harvestQuantity: batchData.harvest_quantity?.toString() || '',
    sowingDate: batchData.sowing_date || '',
    harvestDate: batchData.harvest_date || '',
    freshnessDuration: batchData.freshness_duration?.toString() || '7',
    grading: batchData.grading || 'Standard',
    certification: batchData.certification || 'Standard',
    labTest: batchData.lab_test || '',
    price: batchData.price || batchData.total_price || 0,
    ipfsHash: batchData.ipfs_hash || '',
    languageDetected: batchData.language_detected || '',
    summary: batchData.summary || '',
    callStatus: batchData.call_status || '',
    offTopicCount: batchData.off_topic_count || 0,
    currentOwner: batchData.current_owner || batchData.farmer || '',
  };
  
  return downloadPDFCertificate(batch);
};