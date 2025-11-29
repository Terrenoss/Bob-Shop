import React from 'react';
import { Skeleton } from './ui/Skeleton';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative bg-zinc-800 animate-pulse" />
      <div className="p-5 flex flex-col gap-3 flex-grow">
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
};