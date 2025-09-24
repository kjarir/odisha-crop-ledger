# Blockchain Integration for AgriTrace

This document describes the blockchain integration implemented for the AgriTrace application.

## Overview

The application now integrates with a Solidity smart contract deployed on the blockchain to provide immutable record-keeping for agricultural batch registrations. Each batch registration includes:

1. **PDF Certificate Generation** - Automatic generation of official certificates
2. **IPFS Storage** - Decentralized storage of certificates and metadata
3. **Blockchain Registration** - Immutable record on the blockchain
4. **Local Database Sync** - Backup storage in Supabase

## Smart Contract Details

- **Contract Address**: `0xd9145CCE52D386f254917e481eB44e9943F39138`
- **Network**: Sepolia Testnet (configurable)
- **Contract Name**: AgriTrace

### Key Features

- **Role-based Access Control**: Farmers, Distributors, Retailers
- **Batch Registration**: Complete agricultural produce tracking
- **Ownership Transfer**: Transfer batches between parties
- **Price Updates**: Dynamic pricing management
- **Reputation System**: Farmer reputation tracking
- **Tip System**: Direct payments to farmers

## Technical Implementation

### Dependencies Added

```json
{
  "ethers": "^6.x.x",
  "jspdf": "^2.x.x",
  "html2canvas": "^1.x.x",
  "axios": "^1.x.x"
}
```

### Key Components

1. **Web3Context** (`src/contexts/Web3Context.tsx`)
   - Manages wallet connection
   - Provides contract instance
   - Handles network switching

2. **Contract Hook** (`src/hooks/useContract.ts`)
   - Contract interaction methods
   - Transaction handling
   - Error management

3. **IPFS Service** (`src/utils/ipfs.ts`)
   - Pinata integration
   - File upload/download
   - Metadata management

4. **Certificate Generator** (`src/utils/certificateGenerator.ts`)
   - PDF generation
   - Professional certificate design
   - Batch data integration

### Configuration

#### Contract Configuration (`src/contracts/config.ts`)
```typescript
export const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";
export const PINATA_CONFIG = {
  apiKey: "your-api-key",
  apiSecret: "your-api-secret",
  jwt: "your-jwt-token"
};
```

#### Network Configuration
The application supports multiple networks with easy configuration in the config file.

## Usage Flow

### Batch Registration Process

1. **User connects wallet** via MetaMask
2. **Fills batch registration form** with agricultural data
3. **System generates PDF certificate** automatically
4. **Uploads certificate to IPFS** via Pinata
5. **Registers batch on blockchain** with IPFS hash
6. **Syncs data to local database** for backup

### Key Features

- **Real-time Progress**: Shows upload and blockchain registration progress
- **Error Handling**: Comprehensive error handling with user feedback
- **Wallet Integration**: Seamless MetaMask integration
- **Responsive Design**: Works on desktop and mobile

## API Integration

### Pinata IPFS
- **API Key**: `f36361a622f0539503dd`
- **Gateway**: `https://gateway.pinata.cloud/ipfs/`
- **Features**: File upload, metadata, JSON storage

### Smart Contract Methods

- `registerBatch(BatchInput)` - Register new agricultural batch
- `getBatch(uint256)` - Retrieve batch information
- `transferBatch(uint256, address)` - Transfer ownership
- `updatePrice(uint256, uint256)` - Update batch price
- `tipFarmer(address)` - Send tips to farmers

## Security Considerations

1. **Private Key Management**: Users manage their own keys via MetaMask
2. **Transaction Signing**: All transactions require user approval
3. **IPFS Privacy**: Files are publicly accessible via IPFS hash
4. **Role-based Access**: Smart contract enforces role permissions

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   - Update contract address in `src/contracts/config.ts`
   - Configure Pinata credentials
   - Set up network configuration

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Connect Wallet**:
   - Install MetaMask browser extension
   - Connect to Sepolia testnet
   - Ensure you have test ETH for gas fees

## Testing

The integration has been tested with:
- ✅ TypeScript compilation
- ✅ Wallet connection
- ✅ Contract interaction
- ✅ PDF generation
- ✅ IPFS upload
- ✅ Error handling

## Future Enhancements

1. **Multi-network Support**: Support for multiple blockchain networks
2. **Batch Tracking**: Real-time tracking of batch movements
3. **QR Code Integration**: Generate QR codes for batch verification
4. **Mobile App**: React Native version with wallet integration
5. **Analytics Dashboard**: Blockchain analytics and insights

## Troubleshooting

### Common Issues

1. **Wallet Not Connected**: Ensure MetaMask is installed and unlocked
2. **Network Mismatch**: Switch to the correct network (Sepolia)
3. **Insufficient Gas**: Ensure wallet has enough ETH for gas fees
4. **IPFS Upload Fails**: Check Pinata API credentials
5. **Contract Interaction Fails**: Verify contract address and ABI

### Support

For technical support or questions about the blockchain integration, please refer to the development team or create an issue in the project repository.
