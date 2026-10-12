import React from 'react';
import { Lock, Key, FileText, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TabNavigation({ activeTab, setActiveTab }) {
  const { currentRole } = useAuth();

  return (
    <div className="flex bg-slate-200/70 dark:bg-slate-800/60 p-1.5 rounded-2xl mb-8 border border-slate-300/80 dark:border-slate-700/80 shadow-inner">
      {/* Store Secret Tab */}
      <button
        type="button"
        onClick={() => currentRole.canStore && setActiveTab('store')}
        disabled={!currentRole.canStore}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
          activeTab === 'store'
            ? 'bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-md'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        } ${!currentRole.canStore ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {!currentRole.canStore ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <Lock className="w-4 h-4" />}
        1. Store
      </button>

      {/* Reconstruct Secret Tab */}
      <button
        type="button"
        onClick={() => currentRole.canReconstruct && setActiveTab('reconstruct')}
        disabled={!currentRole.canReconstruct}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
          activeTab === 'reconstruct'
            ? 'bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-md'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        } ${!currentRole.canReconstruct ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {!currentRole.canReconstruct ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <Key className="w-4 h-4" />}
        2. Reconstruct
      </button>

      {/* Audit Logs Tab */}
      <button
        type="button"
        onClick={() => currentRole.canViewAudit && setActiveTab('audit')}
        disabled={!currentRole.canViewAudit}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
          activeTab === 'audit'
            ? 'bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-md'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        } ${!currentRole.canViewAudit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {!currentRole.canViewAudit ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <FileText className="w-4 h-4" />}
        3. Audit Logs
      </button>
    </div>
  );
}