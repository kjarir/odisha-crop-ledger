import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { getSupplyChainHistory } from '@/utils/supplyChainTracker';

interface BatchQuantityDisplayProps {
  batchId: string;
  originalQuantity: number;
  className?: string;
}

export const BatchQuantityDisplay: React.FC<BatchQuantityDisplayProps> = ({ 
  batchId, 
  originalQuantity, 
  className = "" 
}) => {
  const [currentQuantity, setCurrentQuantity] = useState(originalQuantity);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateCurrentQuantity = async () => {
      try {
        setLoading(true);
        const transactions = await getSupplyChainHistory(batchId);
        
        if (transactions.length > 0) {
          // Calculate sold quantity from purchase transactions
          const soldQuantity = transactions
            .filter(tx => tx.type === 'purchase' || tx.type === 'transfer')
            .reduce((sum, tx) => sum + tx.quantity, 0);
          
          const available = Math.max(0, originalQuantity - soldQuantity);
          setCurrentQuantity(available);
        } else {
          setCurrentQuantity(originalQuantity);
        }
      } catch (error) {
        console.error('Error calculating current quantity:', error);
        setCurrentQuantity(originalQuantity);
      } finally {
        setLoading(false);
      }
    };

    calculateCurrentQuantity();
  }, [batchId, originalQuantity]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="text-sm">
          Loading...
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={currentQuantity > 0 ? "default" : "destructive"} 
        className="text-sm"
      >
        {currentQuantity} kg available
      </Badge>
      {currentQuantity < originalQuantity && (
        <Badge variant="outline" className="text-xs">
          {originalQuantity - currentQuantity} kg sold
        </Badge>
      )}
    </div>
  );
};
