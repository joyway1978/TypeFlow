'use client';
import { ReactNode } from 'react';

interface PaperSheetProps {
  children: ReactNode;
  className?: string;
}

export function PaperSheet({ children, className = '' }: PaperSheetProps) {
  return (
    <div className={`w-full max-w-paper rounded-sm border border-paper-edge bg-paper shadow-paper ${className}`}>
      {children}
    </div>
  );
}
