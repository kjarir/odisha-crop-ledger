import QRCode from 'qrcode';

export interface QRCodeData {
  batchId: string;
  cropType: string;
  variety: string;
  harvestDate: string;
  farmerId: string;
  blockchainHash?: string;
  ipfsHash?: string;
  verificationUrl: string;
}

/**
 * Generate QR code data URL for a batch
 */
export const generateQRCodeDataURL = async (data: QRCodeData): Promise<string> => {
  try {
    const qrData = {
      batchId: data.batchId,
      cropType: data.cropType,
      variety: data.variety,
      harvestDate: data.harvestDate,
      farmerId: data.farmerId,
      blockchainHash: data.blockchainHash,
      ipfsHash: data.ipfsHash,
      verificationUrl: data.verificationUrl,
      timestamp: new Date().toISOString()
    };

    const qrString = JSON.stringify(qrData);
    
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code for batch verification URL
 */
export const generateBatchVerificationQR = async (batchId: string, baseUrl: string = window.location.origin): Promise<string> => {
  try {
    const verificationUrl = `${baseUrl}/verify?batchId=${batchId}`;
    
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating verification QR code:', error);
    throw new Error('Failed to generate verification QR code');
  }
};

/**
 * Generate QR code for IPFS certificate URL
 */
export const generateCertificateQR = async (ipfsHash: string, baseUrl: string = 'https://gateway.pinata.cloud/ipfs'): Promise<string> => {
  try {
    const certificateUrl = `${baseUrl}/${ipfsHash}`;
    
    const qrCodeDataURL = await QRCode.toDataURL(certificateUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating certificate QR code:', error);
    throw new Error('Failed to generate certificate QR code');
  }
};

/**
 * Generate QR code that directly opens certificate
 */
export const generateDirectCertificateQR = async (ipfsHash: string, batchId: string, baseUrl: string = 'https://gateway.pinata.cloud/ipfs'): Promise<string> => {
  try {
    const certificateUrl = `${baseUrl}/${ipfsHash}`;
    
    const qrCodeDataURL = await QRCode.toDataURL(certificateUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating direct certificate QR code:', error);
    throw new Error('Failed to generate direct certificate QR code');
  }
};

/**
 * Parse QR code data
 */
export const parseQRCodeData = (qrString: string): QRCodeData | null => {
  try {
    const data = JSON.parse(qrString);
    
    // Validate required fields
    if (!data.batchId || !data.cropType || !data.variety || !data.harvestDate || !data.farmerId) {
      return null;
    }

    return {
      batchId: data.batchId,
      cropType: data.cropType,
      variety: data.variety,
      harvestDate: data.harvestDate,
      farmerId: data.farmerId,
      blockchainHash: data.blockchainHash,
      ipfsHash: data.ipfsHash,
      verificationUrl: data.verificationUrl
    };
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
};

/**
 * Download QR code as image
 */
export const downloadQRCode = (dataURL: string, filename: string = 'qr-code.png') => {
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
};
