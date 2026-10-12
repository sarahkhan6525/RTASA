import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, FileText, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const API_BASE_URL = "http://localhost:8000/api/v1";

  // Fetch live audit logs from backend
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/audit/logs`);
      setLogs(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load real-time audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    setVerificationResult(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/audit/verify`);
      const { chain_valid, message } = response.data;
      
      setVerificationResult({
        valid: chain_valid,
        message: message || `Successfully verified log entries. Cryptographic hash chain status: ${chain_valid ? 'Intact' : 'Tampered'}`
      });

      if (chain_valid) {
        toast.success('Audit log integrity verified!');
      } else {
        toast.error('Tampering detected in audit log chain!');
      }
    } catch (err) {
      console.error(err);
      setVerificationResult({
        valid: false,
        message: 'Failed to verify chain integrity due to a network or server error.'
      });
      toast.error('Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  // Helper to extract a displayable secret ID or clean details string
  const parseDetails = (detailsStr) => {
    if (!detailsStr) return '-';
    try {
      const parsed = JSON.parse(detailsStr);
      return parsed.secret_id || parsed.title || detailsStr;
    } catch (e) {
      return detailsStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm transition-colors">
        
        {/* Header & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700/60 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Tamper-Evident Audit Trail
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time cryptographically linked SHA-256 hash logs for all system operations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleVerifyIntegrity}
              disabled={verifying}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              {verifying ? 'Verifying Hashes...' : 'Verify Chain Integrity'}
            </button>
          </div>
        </div>

        {/* Verification Alert Banner */}
        {verificationResult && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
              verificationResult.valid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
            }`}
          >
            {verificationResult.valid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span className="font-medium">{verificationResult.message}</span>
          </div>
        )}

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-2">Time (UTC)</th>
                <th className="pb-3 px-2">Actor</th>
                <th className="pb-3 px-2">Action</th>
                <th className="pb-3 px-2">Details / Secret ID</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">SHA-256 Entry Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400 font-sans">
                    Loading audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400 font-sans">
                    No audit logs recorded yet. Try storing or reconstructing a secret!
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 font-mono">
                    <td className="py-3 px-2 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {log.actor_id}
                    </td>
                    <td className="py-3 px-2 font-sans">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
                        {log.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-2 truncate max-w-[140px]" title={log.details}>
                      {parseDetails(log.details)}
                    </td>
                    <td className="py-3 px-2 font-sans">
                      <span className={`flex items-center gap-1 font-semibold ${
                        log.status === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {log.status === 'SUCCESS' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[10px] text-slate-400 truncate max-w-[140px]" title={log.current_hash}>
                      {log.current_hash}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}