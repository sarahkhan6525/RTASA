import React from 'react';
import { Upload, Check, Image as ImageIcon } from 'lucide-react';

export default function ImageUploader({ totalN, coverFiles, setCoverFiles }) {
  const handleFileChange = (index, file) => {
    const updated = [...coverFiles];
    updated[index] = file;
    setCoverFiles(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Cover Images for Steganography
        </label>
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          {coverFiles.filter(Boolean).length} of {totalN} uploaded
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        You need exactly <strong className="text-slate-700 dark:text-slate-200">{totalN} PNG cover images</strong> (1 per secret share).
      </p>

      {/* Dynamic Grid based on totalN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: totalN }).map((_, idx) => {
          const file = coverFiles[idx];
          return (
            <div
              key={idx}
              className={`relative border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                file
                  ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-900/50'
              }`}
            >
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => handleFileChange(idx, e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center justify-center gap-1">
                {file ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[140px]">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Upload Image #{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG or JPEG</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}