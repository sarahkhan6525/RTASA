import React, { useState } from 'react';
import { KeyRound, Copy, Check, Lock, Download, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReconstructResult({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  // Standardize payload attributes
  const isFile = result.is_file ?? false;
  const filename = result.filename || 'restored_secret_file';
  const mimeType = result.mime_type || 'application/octet-stream';
  const fileDataB64 = result.file_data_b64 || null;

  // Helper: an object is "usable" only if it's not empty.
  // Strings/numbers/booleans are considered usable if truthy.
  const isUsable = (v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (typeof v === 'object') {
      if (Array.isArray(v)) return v.length > 0;
      return Object.keys(v).length > 0;
    }
    return Boolean(v);
  };

  // Prefer secret_data (new /verify-and-reconstruct shape), then legacy keys.
  // Skip any empty {} / "" so we don't render a bogus blank payload.
  let rawSecretPayload;
  if (isUsable(result.secret_data)) {
    rawSecretPayload = result.secret_data;
  } else if (isUsable(result.decrypted_secret_text)) {
    rawSecretPayload = result.decrypted_secret_text;
  } else if (isUsable(result.secret_text)) {
    rawSecretPayload = result.secret_text;
  } else if (isUsable(result.secret)) {
    rawSecretPayload = result.secret;
  } else if (isUsable(result.payload)) {
    rawSecretPayload = result.payload;
  } else {
    // Nothing usable — show a clear message instead of a JSON dump.
    rawSecretPayload = '[No secret data returned by the server]';
  }

  const displayText =
    typeof rawSecretPayload === 'object'
      ? JSON.stringify(rawSecretPayload, null, 2)
      : String(rawSecretPayload);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    toast.success('Secret copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!fileDataB64) return;

    try {
      const byteCharacters = atob(fileDataB64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      console.error('Failed to download file:', err);
      toast.error('Failed to parse and download restored file.');
    }
  };

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-4 animate-fade-in shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <KeyRound className="w-5 h-5" />
          <span>Secret Successfully Reconstructed!</span>
        </div>

        {!isFile && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Secret
              </>
            )}
          </button>
        )}
      </div>

      {isFile ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {filename}
              </p>
              <p className="text-xs text-slate-500 font-mono">{mimeType}</p>
            </div>
          </div>

          <button
            onClick={handleDownloadFile}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Restored File ({filename})
          </button>
        </div>
      ) : (
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-800 dark:text-slate-100 break-all select-all shadow-inner">
          <div className="absolute top-2 right-2 text-slate-300 dark:text-slate-700 pointer-events-none">
            <Lock className="w-4 h-4 opacity-50" />
          </div>
          {displayText}
        </div>
      )}
    </div>
  );
}