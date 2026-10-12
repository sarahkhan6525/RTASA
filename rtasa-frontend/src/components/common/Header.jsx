import React from 'react';
import { Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import RoleSwitcher from './RoleSwitcher';

export default function Header({ backendOnline }) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 gap-4 transition-colors">
      <div>
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            RTSA System
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Real-time Threshold Secret Architecture with SSS & LSB Steganography
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Role Switcher for RBAC */}
        <RoleSwitcher />

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* API Health Status Badge */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs shadow-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {backendOnline === null
              ? 'Checking API...'
              : backendOnline
              ? 'Backend Online'
              : 'Backend Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}