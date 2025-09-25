import { supabase } from '@/integrations/supabase/client';
import { IPFSService } from './ipfs';
import { SupplyChainTransaction, TransactionChain, OwnershipRecord } from '@/types/transaction';

/**
 * Immutable Transaction Manager
 * Handles creation and retrieval of immutable transaction records
 */
export class TransactionManager {
  private static instance: TransactionManager;
  private ipfsService: IPFSService;

  private constructor() {
    this.ipfsService = IPFSService.getInstance();
  }

  public static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  /**
   * Create a new immutable transaction record
   */
  public async createTransaction(
    type: SupplyChainTransaction['type'],
    from: string,
    to: string,
    quantity: number,
    price: number,
    batchId: string,
    productDetails: SupplyChainTransaction['productDetails'],
    previousTransactionHash?: string,
    metadata?: SupplyChainTransaction['metadata']
  ): Promise<SupplyChainTransaction> {
    try {
      // Generate unique transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create transaction object
      const transaction: SupplyChainTransaction = {
        transactionId,
        type,
        from,
        to,
        quantity,
        price,
        timestamp: new Date().toISOString(),
        previousTransactionHash,
        batchId,
        productDetails,
        metadata,
        ipfsHash: '', // Will be set after IPFS upload
        blockchainHash: undefined
      };

      // Upload transaction to IPFS
      const ipfsResponse = await this.ipfsService.uploadJSON(
        transaction,
        `transaction_${transactionId}.json`,
        {
          name: `Transaction ${transactionId}`,
          keyvalues: {
            batchId: batchId,
            type: type,
            transactionId: transactionId
          }
        }
      );

      // Update transaction with IPFS hash
      transaction.ipfsHash = ipfsResponse.IpfsHash;

      // Store transaction in database
      await this.storeTransactionInDatabase(transaction);

      console.log(`Created transaction ${transactionId} with IPFS hash: ${transaction.ipfsHash}`);
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }
  }

  /**
   * Store transaction in database
   */
  private async storeTransactionInDatabase(transaction: SupplyChainTransaction): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('transactions')
        .insert({
          transaction_id: transaction.transactionId,
          batch_id: transaction.batchId,
          type: transaction.type,
          from_address: transaction.from,
          to_address: transaction.to,
          quantity: transaction.quantity,
          price: transaction.price,
          transaction_timestamp: transaction.timestamp,
          previous_transaction_hash: transaction.previousTransactionHash,
          ipfs_hash: transaction.ipfsHash,
          product_details: transaction.productDetails,
          metadata: transaction.metadata
        });

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Transactions table does not exist. Please run the database migration first.');
        }
        throw error;
      }
    } catch (error) {
      console.error('Error storing transaction in database:', error);
      throw new Error('Failed to store transaction in database');
    }
  }

  /**
   * Get transaction by ID
   */
  public async getTransaction(transactionId: string): Promise<SupplyChainTransaction | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapDatabaseToTransaction(data);
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  }

  /**
   * Get transaction by IPFS hash
   */
  public async getTransactionByIPFSHash(ipfsHash: string): Promise<SupplyChainTransaction | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('ipfs_hash', ipfsHash)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapDatabaseToTransaction(data);
    } catch (error) {
      console.error('Error getting transaction by IPFS hash:', error);
      return null;
    }
  }

  /**
   * Get all transactions for a batch
   */
  public async getBatchTransactions(batchId: string): Promise<SupplyChainTransaction[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('batch_id', batchId)
        .order('transaction_timestamp', { ascending: true });

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('Transactions table does not exist. Please run the database migration.');
          return [];
        }
        throw error;
      }

      return data.map((item: any) => this.mapDatabaseToTransaction(item));
    } catch (error) {
      console.error('Error getting batch transactions:', error);
      return [];
    }
  }

  /**
   * Build complete transaction chain for a batch
   */
  public async getTransactionChain(batchId: string): Promise<TransactionChain> {
    try {
      const transactions = await this.getBatchTransactions(batchId);
      
      if (transactions.length === 0) {
        // Return empty chain instead of throwing error
        return {
          batchId,
          transactions: [],
          currentOwners: {},
          totalQuantity: 0,
          availableQuantity: 0
        };
      }

      // Calculate current ownership
      const currentOwners: { [owner: string]: { quantity: number; lastTransaction: string } } = {};
      let totalQuantity = 0;
      let availableQuantity = 0;

      // Process transactions in order
      for (const transaction of transactions) {
        if (transaction.type === 'HARVEST') {
          // Initial harvest - farmer owns everything
          currentOwners[transaction.to] = {
            quantity: transaction.quantity,
            lastTransaction: transaction.transactionId
          };
          totalQuantity = transaction.quantity;
          availableQuantity = transaction.quantity;
        } else if (transaction.type === 'PURCHASE' || transaction.type === 'TRANSFER') {
          // Transfer ownership
          if (currentOwners[transaction.from]) {
            currentOwners[transaction.from].quantity -= transaction.quantity;
            if (currentOwners[transaction.from].quantity <= 0) {
              delete currentOwners[transaction.from];
            }
          }

          if (currentOwners[transaction.to]) {
            currentOwners[transaction.to].quantity += transaction.quantity;
          } else {
            currentOwners[transaction.to] = {
              quantity: transaction.quantity,
              lastTransaction: transaction.transactionId
            };
          }

          availableQuantity -= transaction.quantity;
        }
      }

      return {
        batchId,
        transactions,
        currentOwners,
        totalQuantity,
        availableQuantity: Math.max(0, availableQuantity)
      };
    } catch (error) {
      console.error('Error building transaction chain:', error);
      throw new Error('Failed to build transaction chain');
    }
  }

  /**
   * Get ownership history for a batch
   */
  public async getOwnershipHistory(batchId: string): Promise<OwnershipRecord[]> {
    try {
      const chain = await this.getTransactionChain(batchId);
      const ownershipHistory: OwnershipRecord[] = [];

      for (const transaction of chain.transactions) {
        if (transaction.type === 'HARVEST' || transaction.type === 'PURCHASE' || transaction.type === 'TRANSFER') {
          ownershipHistory.push({
            owner: transaction.to,
            quantity: transaction.quantity,
            transactionId: transaction.transactionId,
            transaction_timestamp: transaction.timestamp,
            type: transaction.type
          });
        }
      }

      return ownershipHistory;
    } catch (error) {
      console.error('Error getting ownership history:', error);
      return [];
    }
  }

  /**
   * Map database record to transaction object
   */
  private mapDatabaseToTransaction(data: any): SupplyChainTransaction {
    return {
      transactionId: data.transaction_id,
      type: data.type,
      from: data.from_address,
      to: data.to_address,
      quantity: data.quantity,
      price: data.price,
      timestamp: data.transaction_timestamp,
      previousTransactionHash: data.previous_transaction_hash,
      batchId: data.batch_id,
      productDetails: data.product_details,
      metadata: data.metadata,
      ipfsHash: data.ipfs_hash,
      blockchainHash: data.blockchain_hash
    };
  }

  /**
   * Verify transaction chain integrity
   */
  public async verifyTransactionChain(batchId: string): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const chain = await this.getTransactionChain(batchId);
      const errors: string[] = [];

      // Check if first transaction is HARVEST
      if (chain.transactions.length === 0) {
        errors.push('No transactions found');
        return { isValid: false, errors };
      }

      if (chain.transactions[0].type !== 'HARVEST') {
        errors.push('First transaction must be HARVEST');
      }

      // Check transaction linking
      for (let i = 1; i < chain.transactions.length; i++) {
        const current = chain.transactions[i];
        const previous = chain.transactions[i - 1];
        
        if (current.previousTransactionHash !== previous.ipfsHash) {
          errors.push(`Transaction ${current.transactionId} has incorrect previous hash`);
        }
      }

      // Check quantity consistency
      let runningTotal = 0;
      for (const transaction of chain.transactions) {
        if (transaction.type === 'HARVEST') {
          runningTotal = transaction.quantity;
        } else if (transaction.type === 'PURCHASE' || transaction.type === 'TRANSFER') {
          runningTotal -= transaction.quantity;
          if (runningTotal < 0) {
            errors.push(`Transaction ${transaction.transactionId} exceeds available quantity`);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Error verifying transaction chain:', error);
      return {
        isValid: false,
        errors: ['Failed to verify transaction chain']
      };
    }
  }
}

// Export singleton instance
export const transactionManager = TransactionManager.getInstance();
