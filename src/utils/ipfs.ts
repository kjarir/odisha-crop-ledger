import axios from 'axios';
import { PINATA_CONFIG } from '@/contracts/config';

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface PinataMetadata {
  name?: string;
  keyvalues?: Record<string, string>;
}

export class IPFSService {
  private static instance: IPFSService;
  private apiKey: string;
  private apiSecret: string;
  private jwt: string;
  private gatewayUrl: string;

  private constructor() {
    this.apiKey = PINATA_CONFIG.apiKey;
    this.apiSecret = PINATA_CONFIG.apiSecret;
    this.jwt = PINATA_CONFIG.jwt;
    this.gatewayUrl = PINATA_CONFIG.gatewayUrl;
  }

  public static getInstance(): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService();
    }
    return IPFSService.instance;
  }

  /**
   * Upload a file to IPFS via Pinata
   */
  public async uploadFile(
    file: File | Blob,
    fileName: string,
    metadata?: PinataMetadata
  ): Promise<PinataResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file, fileName);

      if (metadata) {
        formData.append('pinataMetadata', JSON.stringify(metadata));
      }

      // Add pinata options
      const pinataOptions = {
        cidVersion: 1,
      };
      formData.append('pinataOptions', JSON.stringify(pinataOptions));

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.apiSecret,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  /**
   * Upload JSON data to IPFS via Pinata
   */
  public async uploadJSON(
    data: any,
    fileName: string,
    metadata?: PinataMetadata
  ): Promise<PinataResponse> {
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: data,
          pinataMetadata: metadata ? {
            name: fileName,
            keyvalues: metadata.keyvalues || {}
          } : {
            name: fileName
          },
          pinataOptions: {
            cidVersion: 1,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.apiSecret,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  /**
   * Upload a PDF certificate to IPFS
   */
  public async uploadCertificate(
    pdfBlob: Blob,
    batchId: number,
    batchData: any
  ): Promise<string> {
    try {
      const fileName = `AgriTrace_Certificate_${batchId}.pdf`;
      const metadata: PinataMetadata = {
        name: fileName,
        keyvalues: {
          batchId: batchId.toString(),
          crop: batchData.crop || '',
          variety: batchData.variety || '',
          farmer: batchData.farmer || '',
          type: 'certificate',
          timestamp: new Date().toISOString(),
        },
      };

      const response = await this.uploadFile(pdfBlob, fileName, metadata);
      return response.IpfsHash;
    } catch (error) {
      console.error('Error uploading certificate to IPFS:', error);
      throw new Error('Failed to upload certificate to IPFS');
    }
  }

  /**
   * Upload batch metadata to IPFS
   */
  public async uploadBatchMetadata(
    batchData: any,
    batchId: number
  ): Promise<string> {
    try {
      const fileName = `batch_metadata_${batchId}.json`;
      const metadata: PinataMetadata = {
        name: fileName,
        keyvalues: {
          batchId: batchId.toString(),
          type: 'batch_metadata',
          timestamp: new Date().toISOString(),
        },
      };

      const response = await this.uploadJSON(batchData, fileName, metadata);
      return response.IpfsHash;
    } catch (error) {
      console.error('Error uploading batch metadata to IPFS:', error);
      throw new Error('Failed to upload batch metadata to IPFS');
    }
  }

  /**
   * Get file from IPFS via Pinata gateway
   */
  public getFileUrl(ipfsHash: string): string {
    return `${this.gatewayUrl}${ipfsHash}`;
  }

  /**
   * Fetch JSON data from IPFS
   */
  public async fetchJSON(ipfsHash: string): Promise<any> {
    try {
      const url = this.getFileUrl(ipfsHash);
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching JSON from IPFS:', error);
      throw new Error('Failed to fetch data from IPFS');
    }
  }

  /**
   * Check if a file exists on IPFS
   */
  public async checkFileExists(ipfsHash: string): Promise<boolean> {
    try {
      const url = this.getFileUrl(ipfsHash);
      const response = await axios.head(url);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file info from Pinata
   */
  public async getFileInfo(ipfsHash: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?hashContains=${ipfsHash}`,
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.apiSecret,
          },
        }
      );

      return response.data.rows[0] || null;
    } catch (error) {
      console.error('Error getting file info from Pinata:', error);
      return null;
    }
  }

  /**
   * Update an existing pinned file by unpinning the old one and pinning the new one
   */
  public async updatePinnedFile(
    oldIpfsHash: string,
    newFile: File | Blob,
    fileName: string,
    metadata?: PinataMetadata
  ): Promise<PinataResponse> {
    try {
      // First, unpin the old file
      await this.unpinFile(oldIpfsHash);
      
      // Then pin the new file
      const newResponse = await this.uploadFile(newFile, fileName, metadata);
      
      return newResponse;
    } catch (error) {
      console.error('Error updating pinned file:', error);
      throw new Error('Failed to update pinned file');
    }
  }

  /**
   * Unpin a file from Pinata
   */
  public async unpinFile(ipfsHash: string): Promise<boolean> {
    try {
      const response = await axios.delete(
        `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.apiSecret,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error unpinning file:', error);
      return false;
    }
  }
}

// Export singleton instance
export const ipfsService = IPFSService.getInstance();

// Convenience functions
export const uploadToIPFS = (file: File | Blob, fileName: string, metadata?: PinataMetadata) => {
  return ipfsService.uploadFile(file, fileName, metadata);
};

export const uploadJSONToIPFS = (data: any, fileName: string, metadata?: PinataMetadata) => {
  return ipfsService.uploadJSON(data, fileName, metadata);
};

export const uploadCertificateToIPFS = (pdfBlob: Blob, batchId: number, batchData: any) => {
  return ipfsService.uploadCertificate(pdfBlob, batchId, batchData);
};

export const uploadBatchMetadataToIPFS = (batchData: any, batchId: number) => {
  return ipfsService.uploadBatchMetadata(batchData, batchId);
};

export const getIPFSFileUrl = (ipfsHash: string) => {
  return ipfsService.getFileUrl(ipfsHash);
};

export const fetchFromIPFS = (ipfsHash: string) => {
  return ipfsService.fetchJSON(ipfsHash);
};
