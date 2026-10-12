import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/common/Header';
import TabNavigation from './components/common/TabNavigation';
import StoreForm from './components/store/StoreForm';
import ReconstructForm from './components/reconstruct/ReconstructForm';
import { checkHealth } from './api/secrets';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Lock } from 'lucide-react';
import AuditLogs from './components/audit/AuditLogs';


function AppContent() {
  const [activeTab, setActiveTab] = useState('store');
  const [backendOnline, setBackendOnline] = useState(null);
  const { currentRole } = useAuth();

  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, []);

  // Auto-switch tab if current active tab is disabled for the selected role
  useEffect(() => {
    if (activeTab === 'reconstruct' && !currentRole.canReconstruct) {
      setActiveTab('store');
    }
  }, [currentRole, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors font-sans p-4 sm:p-8">
      {/* Toast Notification Mount Point */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a', // Tailwind slate-900
            color: '#f8fafc', // Tailwind slate-50
            border: '1px solid #334155', // Tailwind slate-700
            borderRadius: '12px',
            fontSize: '13px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#10b981', // Emerald-500
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Red-500
              secondary: '#ffffff',
            },
          },
        }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <Header backendOnline={backendOnline} />
        
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Access Restriction Warning Banner */}
        {activeTab === 'reconstruct' && !currentRole.canReconstruct && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-4 rounded-2xl text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              Access Restricted: Your active role (<strong>{currentRole.label}</strong>) does not have permission to reconstruct secrets. Switch to <strong>Admin</strong> or <strong>Security Officer</strong> in the header.
            </span>
          </div>
        )}

        <main>
          {activeTab === 'store' && currentRole.canStore && (
            <StoreForm backendOnline={backendOnline} />
          )}

          {activeTab === 'reconstruct' && currentRole.canReconstruct && (
            <ReconstructForm backendOnline={backendOnline} />
          )}
          {activeTab === 'audit' && currentRole.canViewAudit && (
            <AuditLogs />
        )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}