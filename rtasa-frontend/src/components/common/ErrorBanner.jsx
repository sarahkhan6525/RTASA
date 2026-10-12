import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm shadow-sm animate-fade-in">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  );
}