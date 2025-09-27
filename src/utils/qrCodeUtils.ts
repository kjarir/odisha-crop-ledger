/**
 * QR Code Utilities
 */

export interface QRCodeData {
  batchId: string;
  cropType: string;
  variety: string;
  harvestDate: string;
  farmerId: string;
  blockchainHash?: string;
  ipfsHash?: string;
  verificationUrl?: string;
  type?: 'batch' | 'certificate' | 'transaction';
  id?: string;
  timestamp?: string;
  metadata?: any;
}

/**
 * Generate QR code data for a batch
 */
export function generateBatchQRData(batchId: string, ipfsHash: string, metadata?: any): QRCodeData {
  return {
    type: 'batch',
    id: batchId,
    ipfsHash,
    timestamp: new Date().toISOString(),
    metadata
  };
}

/**
 * Generate QR code data for a certificate
 */
export function generateCertificateQRData(certificateId: string, ipfsHash: string, metadata?: any): QRCodeData {
  return {
    type: 'certificate',
    id: certificateId,
    ipfsHash,
    timestamp: new Date().toISOString(),
    metadata
  };
}

/**
 * Generate QR code data for a transaction
 */
export function generateTransactionQRData(transactionId: string, ipfsHash: string, metadata?: any): QRCodeData {
  return {
    type: 'transaction',
    id: transactionId,
    ipfsHash,
    timestamp: new Date().toISOString(),
    metadata
  };
}

/**
 * Parse QR code data from string
 */
export function parseQRCodeData(qrString: string): QRCodeData | null {
  try {
    const data = JSON.parse(qrString);
    
    // Validate required fields
    if (!data.type || !data.id || !data.ipfsHash || !data.timestamp) {
      return null;
    }
    
    // Validate type
    if (!['batch', 'certificate', 'transaction'].includes(data.type)) {
      return null;
    }
    
    return data as QRCodeData;
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
}

/**
 * Generate QR code URL for viewing
 */
export function generateQRCodeUrl(qrData: QRCodeData): string {
  return `https://gateway.pinata.cloud/ipfs/${qrData.ipfsHash}`;
}

/**
 * Generate verification URL
 */
export function generateVerificationUrl(qrData: QRCodeData): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/verify?type=${qrData.type}&id=${qrData.id}&hash=${qrData.ipfsHash}`;
}

/**
 * Generate QR code data URL for display
 */
export function generateQRCodeDataURL(data: QRCodeData | string, size: number = 200): string {
  // This is a placeholder - in a real implementation, you'd use a QR code library
  // For now, we'll return a data URL that represents the QR code
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Simple placeholder QR code representation
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 10, size - 20, size - 20);
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', size / 2, size / 2);
    const displayText = typeof data === 'string' ? data : data.batchId || data.id || 'QR';
    ctx.fillText(displayText.substring(0, 20), size / 2, size / 2 + 20);
  }
  
  return canvas.toDataURL();
}

/**
 * Generate batch verification QR code
 */
export function generateBatchVerificationQR(batchId: string): Promise<string> {
  const verificationUrl = `${window.location.origin}/verify?batchId=${batchId}`;
  return Promise.resolve(generateQRCodeDataURL(verificationUrl));
}

/**
 * Generate certificate QR code
 */
export function generateCertificateQR(ipfsHash: string): Promise<string> {
  const certificateUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  return Promise.resolve(generateQRCodeDataURL(certificateUrl));
}

/**
 * Download QR code as image
 */
export function downloadQRCode(dataUrl: string, filename: string): void {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
}