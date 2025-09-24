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
  
  // Government-style colors
  const primaryColor = [0, 51, 102]; // Deep blue
  const accentColor = [255, 215, 0]; // Gold
  const textColor = [0, 0, 0]; // Black
  const lightGray = [240, 240, 240]; // Light gray for backgrounds
  
  // Background pattern (subtle)
  doc.setFillColor(...lightGray);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Ornamental border
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  // Inner decorative border
  doc.setLineWidth(1);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
  
  // Header section with government seal area
  doc.setFillColor(...primaryColor);
  doc.rect(20, 20, pageWidth - 40, 50, 'F');
  
  // Government emblem area (circular)
  doc.setFillColor(...accentColor);
  doc.circle(pageWidth / 2, 45, 15, 'F');
  
  // Emblem text
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVT', pageWidth / 2, 42, { align: 'center' });
  doc.text('OF', pageWidth / 2, 45, { align: 'center' });
  doc.text('ODISHA', pageWidth / 2, 48, { align: 'center' });
  
  // Main title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE OF AGRICULTURAL TRACEABILITY', pageWidth / 2, 25, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Government of Odisha - Department of Agriculture & Farmers Empowerment', pageWidth / 2, 32, { align: 'center' });
  
  // Certificate number and date
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Certificate No: ATC-${batchData.id}-${new Date().getFullYear()}`, 30, 80);
  doc.text(`Date of Issue: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 30, 80, { align: 'right' });
  
  // Certificate body
  let yPosition = 90;
  const lineHeight = 6;
  
  // Official declaration
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('This is to certify that:', 30, yPosition);
  yPosition += 15;
  
  // Product information in a formal table format
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const productInfo = [
    { label: 'Product Name', value: `${batchData.crop || 'N/A'} - ${batchData.variety || 'N/A'}` },
    { label: 'Batch Identification Number', value: `ATC-${batchData.id}-${new Date().getFullYear()}` },
    { label: 'Original Harvest Quantity', value: `${batchData.originalQuantity || batchData.harvestQuantity || 'N/A'} kg` },
    { label: 'Current Available Quantity', value: `${batchData.currentQuantity || batchData.harvestQuantity || 'N/A'} kg` },
    { label: 'Sowing Date', value: batchData.sowingDate ? new Date(batchData.sowingDate).toLocaleDateString('en-IN') : 'N/A' },
    { label: 'Harvest Date', value: batchData.harvestDate ? new Date(batchData.harvestDate).toLocaleDateString('en-IN') : 'N/A' },
    { label: 'Quality Grade', value: batchData.grading || 'Standard' },
    { label: 'Certification Level', value: batchData.certification || 'Standard' },
    { label: 'Freshness Duration', value: `${batchData.freshnessDuration || 'N/A'} days` },
    { label: 'Current Market Price', value: batchData.price ? `₹${(batchData.price / 100).toFixed(2)} per kg` : 'N/A' },
    { label: 'Current Owner', value: batchData.currentOwner || 'N/A' },
    { label: 'Blockchain Verification Hash', value: batchData.ipfsHash ? `${batchData.ipfsHash.substring(0, 20)}...` : 'N/A' },
  ];
  
  // Create a formal table layout
  productInfo.forEach((field, index) => {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Draw table row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(30, yPosition - 3, pageWidth - 60, 12, 'F');
    }
    
    // Field label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${field.label}:`, 35, yPosition);
    
    // Field value
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const textWidth = doc.getTextWidth(field.value);
    if (textWidth > pageWidth - 120) {
      // Split long text
      const splitText = doc.splitTextToSize(field.value, pageWidth - 120);
      doc.text(splitText, 35, yPosition + 4);
      yPosition += lineHeight * splitText.length;
    } else {
      doc.text(field.value, 35, yPosition + 4);
      yPosition += lineHeight;
    }
    
    yPosition += 8;
  });

  // Add supply chain transaction history if available
  if (batchData.transactionHistory && batchData.transactionHistory.length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 120) {
      doc.addPage();
      yPosition = 30;
    }

    yPosition += 15;
    
    // Supply Chain History Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('SUPPLY CHAIN TRANSACTION HISTORY', 30, yPosition);
    yPosition += 8;

    // Draw line under header
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(30, yPosition, pageWidth - 30, yPosition);
    yPosition += 10;

    // Transaction details in formal format
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    
    batchData.transactionHistory.forEach((transaction, index) => {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 30;
      }

      // Transaction header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Transaction ${index + 1}: ${transaction.type.toUpperCase()}`, 35, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(new Date(transaction.timestamp).toLocaleDateString('en-IN'), pageWidth - 35, yPosition, { align: 'right' });
      yPosition += 6;

      // Transaction details in table format
      const details = [
        { label: 'From', value: transaction.from },
        { label: 'To', value: transaction.to },
        { label: 'Quantity', value: `${transaction.quantity} kg` },
        { label: 'Price', value: `₹${(transaction.price / 100).toFixed(2)}` }
      ];

      details.forEach(detail => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${detail.label}:`, 40, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(detail.value, 40 + 25, yPosition);
        yPosition += 4;
      });
      
      if (transaction.location) {
        doc.setFont('helvetica', 'bold');
        doc.text('Location:', 40, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(transaction.location, 40 + 25, yPosition);
        yPosition += 4;
      }
      
      if (transaction.notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', 40, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(transaction.notes, 40 + 25, yPosition);
        yPosition += 4;
      }

      yPosition += 8;
    });
  }
  
  // Official declaration
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('This certificate is issued under the authority of the Government of Odisha', 30, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('and certifies the authenticity and traceability of the above-mentioned agricultural produce.', 30, yPosition);
  
  // Footer with official signatures
  yPosition = pageHeight - 60;
  
  // Signature lines
  doc.setDrawColor(...textColor);
  doc.setLineWidth(0.5);
  doc.line(50, yPosition, 120, yPosition);
  doc.line(pageWidth - 120, yPosition, pageWidth - 50, yPosition);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', 50, yPosition + 8);
  doc.text('Department of Agriculture', 50, yPosition + 12);
  doc.text('Government of Odisha', 50, yPosition + 16);
  
  doc.text('Digital Verification', pageWidth - 120, yPosition + 8);
  doc.text('Blockchain Hash', pageWidth - 120, yPosition + 12);
  doc.text(batchData.ipfsHash ? `${batchData.ipfsHash.substring(0, 15)}...` : 'N/A', pageWidth - 120, yPosition + 16);
  
  // Official seal area
  yPosition = pageHeight - 40;
  doc.setFillColor(...accentColor);
  doc.circle(pageWidth / 2, yPosition, 12, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL', pageWidth / 2, yPosition - 2, { align: 'center' });
  doc.text('SEAL', pageWidth / 2, yPosition + 2, { align: 'center' });
  doc.text('ODISHA', pageWidth / 2, yPosition + 6, { align: 'center' });
  
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