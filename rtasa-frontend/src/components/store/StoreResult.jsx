import React from 'react';
import { CheckCircle2, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { getShareImageUrl } from '../../api/secrets';

export default function StoreResult({ result, onQuickReconstruct }) {
  if (!result) return null;

  return (
    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-6 animate-fade-in shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="text-base font-bold">Secret Split & Embedded Successfully!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Shamir Secret Shares generated and hidden inside carrier images via LSB steganography.
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 font-mono">
        <p><strong className="text-slate-800 dark:text-slate-200">Secret ID:</strong> {result.id}</p>
        <p><strong className="text-slate-800 dark:text-slate-200">Owner ID:</strong> {result.owner_id}</p>
      </div>

      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
        Generated Shares & API Image Downloads
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {result.shares.map((share) => {
          const imageUrl = getShareImageUrl(share.id);
          return (
            <div
              key={share.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 shadow-sm"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Share #{share.share_index}
                </span>
                {share.has_stego_image && (
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-500/20">
                    Stego Image Ready
                  </span>
                )}
              </div>

              {share.psnr_db !== undefined && (
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-mono">
                  <div>PSNR: <strong className="text-slate-800 dark:text-slate-200">{share.psnr_db} dB</strong></div>
                  <div>SSIM: <strong className="text-slate-800 dark:text-slate-200">{share.ssim}</strong></div>
                </div>
              )}

              {/* Download Stego Image from API Button */}
              {share.has_stego_image && (
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`stego_share_${share.share_index}.png`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 rounded-lg border border-slate-300 dark:border-slate-700 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-blue-500" />
                  Download Share #{share.share_index} Image (via API)
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}