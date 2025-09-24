import { ethers } from 'ethers';
import { getBatchFromBlockchain } from '@/utils/contractUtils';
import { fetchFromIPFS, getIPFSFileUrl } from '@/utils/ipfs';
import { Batch } from '@/contracts/config';
import { findBatchById, findBatchByField } from '@/utils/databaseUtils';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface VerificationResult {
  isValid: boolean;
  batchData?: Batch;
  blockchainData?: any;
  ipfsData?: any;
  errors: string[];
  warnings: string[];
}

export interface CertificateData {
  batchId: number;
  crop: string;
  variety: string;
  harvestQuantity: string;
  sowingDate: string;
  harvestDate: string;
  freshnessDuration: string;
  grading: string;
  certification: string;
  labTest: string;
  price: number;
  farmer: string;
  currentOwner: string;
  ipfsHash: string;
  blockchainId?: number;
}

/**
 * Verify a certificate by checking blockchain, IPFS, and data consistency
 */
export const verifyCertificate = async (
  batchId: number,
  ipfsHash?: string,
  provider?: ethers.Provider
): Promise<VerificationResult> => {
  const result: VerificationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  try {
    // Step 1: Verify blockchain data
    let blockchainData: Batch | null = null;
    
    if (provider) {
      blockchainData = await getBatchFromBlockchain(batchId, provider);
    } else {
      // Fallback: try to get provider from window.ethereum
      if (window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        blockchainData = await getBatchFromBlockchain(batchId, web3Provider);
      }
    }
    
    if (!blockchainData) {
      // Check if this might be a fallback ID (timestamp-based)
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const timeDiff = Math.abs(currentTimestamp - batchId);
      
      if (timeDiff < 86400) { // Within 24 hours
        result.warnings.push('Batch ID appears to be a fallback ID (not registered on blockchain)');
        result.warnings.push('This batch may have been registered during a blockchain transaction failure');
      } else {
        result.errors.push('Batch not found on blockchain');
      }
      
      // Even if not on blockchain, we can still verify IPFS data if available
      if (ipfsHash) {
        try {
          const ipfsData = await fetchFromIPFS(ipfsHash);
          result.ipfsData = ipfsData;
          result.warnings.push('Certificate exists on IPFS but batch not found on blockchain');
        } catch (error) {
          result.errors.push('Failed to fetch data from IPFS');
        }
      }
      
      return result;
    }

    result.blockchainData = blockchainData;

    // Step 2: Verify IPFS data if hash provided
    if (ipfsHash) {
      try {
        const ipfsData = await fetchFromIPFS(ipfsHash);
        result.ipfsData = ipfsData;
        
        // Verify IPFS hash matches blockchain
        if (blockchainData.ipfsHash !== ipfsHash) {
          result.errors.push('IPFS hash mismatch between certificate and blockchain');
        }
      } catch (error) {
        result.errors.push('Failed to fetch data from IPFS');
      }
    }

    // Step 3: Data consistency checks
    if (blockchainData.id !== batchId) {
      result.errors.push('Batch ID mismatch');
    }

    // Step 4: Validate required fields
    const requiredFields = [
      'crop', 'variety', 'harvestQuantity', 'sowingDate', 
      'harvestDate', 'grading', 'certification', 'price'
    ];

    for (const field of requiredFields) {
      if (!blockchainData[field as keyof Batch] || blockchainData[field as keyof Batch] === '') {
        result.errors.push(`Missing required field: ${field}`);
      }
    }

    // Step 5: Business logic validation
    if (blockchainData.price <= 0) {
      result.errors.push('Invalid price: must be greater than 0');
    }

    const sowingDate = new Date(blockchainData.sowingDate);
    const harvestDate = new Date(blockchainData.harvestDate);
    
    if (harvestDate <= sowingDate) {
      result.errors.push('Harvest date must be after sowing date');
    }

    if (isNaN(sowingDate.getTime())) {
      result.errors.push('Invalid sowing date format');
    }

    if (isNaN(harvestDate.getTime())) {
      result.errors.push('Invalid harvest date format');
    }

    // Step 6: Check if batch is still owned by original farmer
    if (blockchainData.currentOwner !== blockchainData.farmer) {
      result.warnings.push('Batch ownership has been transferred');
    }

    // Step 7: Check freshness
    const daysSinceHarvest = Math.floor(
      (Date.now() - harvestDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceHarvest > parseInt(blockchainData.freshnessDuration)) {
      result.warnings.push('Batch may be past freshness duration');
    }

    // Step 8: Final validation
    result.isValid = result.errors.length === 0;
    result.batchData = blockchainData;

  } catch (error) {
    result.errors.push(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

/**
 * Verify certificate from IPFS hash only
 */
export const verifyCertificateFromIPFS = async (
  ipfsHash: string,
  provider?: ethers.Provider
): Promise<VerificationResult> => {
  const result: VerificationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  try {
    // Fetch data from IPFS
    const ipfsData = await fetchFromIPFS(ipfsHash);
    result.ipfsData = ipfsData;

    // Try to extract batch ID from various possible fields
    const batchId = ipfsData.batchId || ipfsData.id || ipfsData.blockchain_id || ipfsData.blockchain_batch_id;
    
    if (!batchId) {
      // If no batch ID found, try to verify using database fallback
      result.warnings.push('No batch ID found in IPFS data');
      result.warnings.push('Attempting to verify using database records');
      
      // Try to find batch in database using IPFS hash
      try {
        // Try to find batch by IPFS hash using safe queries
        let dbBatch = await findBatchByField('ipfs_hash', ipfsHash);
        
        if (!dbBatch) {
          dbBatch = await findBatchByField('ipfs_certificate_hash', ipfsHash);
        }

        if (!dbBatch) {
          result.errors.push('No batch found in database for this IPFS hash');
          return result;
        }

        // Create mock batch data from database
        const mockBatchData: Batch = {
          id: dbBatch.blockchain_id || dbBatch.blockchain_batch_id || Math.floor(Date.now() / 1000),
          farmer: '0x0000000000000000000000000000000000000000',
          crop: dbBatch.crop_type || '',
          variety: dbBatch.variety || '',
          harvestQuantity: dbBatch.harvest_quantity?.toString() || '',
          sowingDate: dbBatch.sowing_date || '',
          harvestDate: dbBatch.harvest_date || '',
          freshnessDuration: dbBatch.freshness_duration?.toString() || '',
          grading: dbBatch.grading || '',
          certification: dbBatch.certification || '',
          labTest: dbBatch.lab_test_results || '',
          price: Math.floor((dbBatch.price_per_kg || 0) * (dbBatch.harvest_quantity || 0) * 100),
          ipfsHash: ipfsHash,
          languageDetected: '',
          summary: '',
          callStatus: '',
          offTopicCount: 0,
          currentOwner: '0x0000000000000000000000000000000000000000'
        };

        result.batchData = mockBatchData;
        result.warnings.push('Batch found in database but not on blockchain');
        result.warnings.push('Certificate is valid based on database records');
        result.isValid = true;
        return result;

      } catch (dbError) {
        result.errors.push('Database verification failed');
        return result;
      }
    }

    // Verify against blockchain using the found batch ID
    return await verifyCertificateWithDatabaseFallback(Number(batchId), provider);

  } catch (error) {
    result.errors.push(`Failed to verify from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};

/**
 * Verify certificate using database data as fallback
 */
export const verifyCertificateWithDatabaseFallback = async (
  batchId: number,
  provider?: ethers.Provider
): Promise<VerificationResult> => {
  const result: VerificationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  try {
    // First try blockchain verification
    const blockchainResult = await verifyCertificate(batchId, undefined, provider);
    
    if (blockchainResult.isValid) {
      return blockchainResult;
    }

    // If blockchain verification fails, try database fallback
    try {
      // Use safe database query
      const dbBatch = await findBatchById(batchId);
      
      if (!dbBatch) {
        result.errors.push('Batch not found in database or blockchain');
        return result;
      }

      // Create a mock batch data from database
      const mockBatchData: Batch = {
        id: batchId,
        farmer: '0x0000000000000000000000000000000000000000', // Unknown farmer
        crop: dbBatch.crop_type || '',
        variety: dbBatch.variety || '',
        harvestQuantity: dbBatch.harvest_quantity?.toString() || '',
        sowingDate: dbBatch.sowing_date || '',
        harvestDate: dbBatch.harvest_date || '',
        freshnessDuration: dbBatch.freshness_duration?.toString() || '',
        grading: dbBatch.grading || '',
        certification: dbBatch.certification || '',
        labTest: dbBatch.lab_test_results || '',
        price: Math.floor((dbBatch.price_per_kg || 0) * (dbBatch.harvest_quantity || 0) * 100), // Convert to paise
        ipfsHash: dbBatch.ipfs_hash || dbBatch.ipfs_certificate_hash || '',
        languageDetected: '',
        summary: '',
        callStatus: '',
        offTopicCount: 0,
        currentOwner: '0x0000000000000000000000000000000000000000'
      };

      result.batchData = mockBatchData;
      result.warnings.push('Batch found in database but not on blockchain');
      result.warnings.push('This may indicate a blockchain transaction failure during registration');
      
      // Check if IPFS certificate exists
      const ipfsHash = dbBatch.ipfs_hash || dbBatch.ipfs_certificate_hash;
      if (ipfsHash) {
        try {
          const ipfsData = await fetchFromIPFS(ipfsHash);
          result.ipfsData = ipfsData;
          result.warnings.push('Certificate exists on IPFS');
        } catch (error) {
          result.warnings.push('IPFS certificate not accessible');
        }
      }

      // Basic validation
      if (dbBatch.crop_type && dbBatch.variety && dbBatch.harvest_quantity > 0) {
        result.isValid = true;
        result.warnings.push('Certificate is valid based on database records');
      } else {
        result.errors.push('Incomplete batch data in database');
      }

    } catch (dbError) {
      result.errors.push('Database verification failed');
    }

  } catch (error) {
    result.errors.push(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

/**
 * Generate verification report
 */
export const generateVerificationReport = (result: VerificationResult): string => {
  let report = `# Certificate Verification Report\n\n`;
  
  if (result.isValid) {
    report += `✅ **VERIFIED** - Certificate is authentic and valid\n\n`;
  } else {
    report += `❌ **INVALID** - Certificate verification failed\n\n`;
  }

  if (result.batchData) {
    report += `## Batch Information\n`;
    report += `- **Batch ID**: ${result.batchData.id}\n`;
    report += `- **Crop**: ${result.batchData.crop}\n`;
    report += `- **Variety**: ${result.batchData.variety}\n`;
    report += `- **Farmer**: ${result.batchData.farmer}\n`;
    report += `- **Current Owner**: ${result.batchData.currentOwner}\n`;
    report += `- **Price**: ₹${result.batchData.price}\n`;
    report += `- **IPFS Hash**: ${result.batchData.ipfsHash}\n\n`;
  }

  if (result.errors.length > 0) {
    report += `## Errors\n`;
    result.errors.forEach(error => {
      report += `- ❌ ${error}\n`;
    });
    report += `\n`;
  }

  if (result.warnings.length > 0) {
    report += `## Warnings\n`;
    result.warnings.forEach(warning => {
      report += `- ⚠️ ${warning}\n`;
    });
    report += `\n`;
  }

  report += `## Verification Details\n`;
  report += `- **Blockchain Verified**: ${result.blockchainData ? 'Yes' : 'No'}\n`;
  report += `- **IPFS Verified**: ${result.ipfsData ? 'Yes' : 'No'}\n`;
  report += `- **Verification Time**: ${new Date().toISOString()}\n`;

  return report;
};

/**
 * Extract certificate data from PDF or IPFS
 */
export const extractCertificateData = async (ipfsHash: string): Promise<CertificateData | null> => {
  try {
    const data = await fetchFromIPFS(ipfsHash);
    
    return {
      batchId: data.id || data.batchId,
      crop: data.crop || data.crop_type,
      variety: data.variety,
      harvestQuantity: data.harvestQuantity || data.harvest_quantity,
      sowingDate: data.sowingDate || data.sowing_date,
      harvestDate: data.harvestDate || data.harvest_date,
      freshnessDuration: data.freshnessDuration || data.freshness_duration,
      grading: data.grading,
      certification: data.certification,
      labTest: data.labTest || data.lab_test,
      price: data.price || data.total_price,
      farmer: data.farmer,
      currentOwner: data.currentOwner || data.current_owner,
      ipfsHash: ipfsHash,
      blockchainId: data.blockchain_id
    };
  } catch (error) {
    console.error('Failed to extract certificate data:', error);
    return null;
  }
};

/**
 * Quick verification for batch ID
 */
export const quickVerifyBatch = async (batchId: number, provider?: ethers.Provider): Promise<boolean> => {
  try {
    const result = await verifyCertificate(batchId, undefined, provider);
    return result.isValid;
  } catch (error) {
    return false;
  }
};
