import React from 'react';
import { Badge } from '@/components/ui/badge';

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
  // For now, just show the original quantity to avoid database errors
  // TODO: Implement proper quantity tracking when database schema is stable
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="default" className="text-sm">
        {originalQuantity} kg available
      </Badge>
    </div>
  );
};
