import React, { useState } from 'react';
import { Key, Upload, FileImage, Unlock, Trash2, Plus, Hash, Mail, KeyRound, ShieldCheck, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ReconstructResult from './ReconstructResult';
import ErrorBanner from '../common/ErrorBanner';
import axios from 'axios';

export default function ReconstructForm({ backendOnline }) {
  const [step, setStep] = useState(1); // Step 1: Input details & request OTP, Step 2: Enter OTP & Reconstruct
  const [secretId, setSecretId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Manager'); // Role state
  const [token, setToken] = useState('');
  const [stegoFiles, setStegoFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Store full response object to handle BOTH text and binary file outputs
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const API_BASE_URL = "http://localhost:8000/api/v1";

  // Append new files without overwriting existing selections
  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setStegoFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setStegoFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Helper: convert a File to a Base64 string (no data: prefix)
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = String(reader.result || '');
        const commaIdx = result.indexOf(',');
        resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
      };
      reader.onerror = (err) => reject(err);
    });

  // Step 1: Request email OTP token with Role payload
  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');

    if (!secretId.trim()) {
      const errMsg = 'Please provide the Secret ID.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (!email.trim()) {
      const errMsg = 'Please provide the recipient email address.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (stegoFiles.length < 2) {
      const errMsg = 'Please select at least 2 stego PNG image files to attempt reconstruction.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    setLoading(true);

    try {
      // JSON payload — no binary, no FormData
      await axios.post(`${API_BASE_URL}/secrets/request-token`, {
        secret_id: secretId.trim(),
        email: email.trim(),
        role: role,
      });

      toast.success('Verification code sent to email!');
      setStep(2); // Move to OTP verification step
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to request reconstruction token.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Execute Reconstruction
  const handleVerifyAndReconstruct = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim() || token.length !== 6) {
      const errMsg = 'Please enter a valid 6-digit verification code.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    setLoading(true);

    try {
      // Convert every stego file to a Base64 string (no data: prefix)
      const base64Images = await Promise.all(
        stegoFiles.map((file) => fileToBase64(file))
      );

      // JSON payload — all binary data as Base64 strings
      const payload = {
        secret_id: secretId.trim(),
        token: token.trim(),
        email: email.trim(),
        role: role,
        stego_images: base64Images,
      };

      const response = await axios.post(
        `${API_BASE_URL}/secrets/verify-and-reconstruct`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Save complete backend response object
      setResult(response.data);
      toast.success('Secret reconstructed securely via role-based 2FA!');
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Invalid or expired verification token. Reconstruction failed.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={step === 1 ? handleRequestToken : handleVerifyAndReconstruct}
        className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm transition-colors"
      >
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Secure Role-Based Secret Reconstruction (2FA)
        </h2>

        {step === 1 ? (
          <>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Enter your <strong className="text-slate-800 dark:text-slate-200">Secret ID</strong>, email, select your authorized clearance role, and upload at least <strong className="text-slate-800 dark:text-slate-200">threshold (k) stego PNG images</strong>.
            </p>

            {/* Secret ID Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-blue-500" /> Secret ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 031dba3c-b22b-4d77-8f52-f13135249a4c"
                value={secretId}
                onChange={(e) => setSecretId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono"
              />
            </div>

            {/* Recipient Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" /> Recipient Email (for OTP verification)
              </label>
              <input
                type="email"
                required
                placeholder="recipient@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            {/* Role / Clearance Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Authorized Role / Clearance Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
              >
                <option value="Manager">Manager / Director</option>
                <option value="Department Lead">Department Lead</option>
                <option value="IT Security Officer">IT Security Officer</option>
                <option value="Authorized Holder">Key Holder / Worker</option>
              </select>
            </div>

            {/* Upload Dropzone */}
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-900/30 transition-all">
              <input
                type="file"
                multiple
                accept="image/png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Plus className="w-4 h-4 text-blue-500" /> Click or drag stego PNG files here
                </span>
                <span className="text-[10px] text-slate-400">Hold Ctrl/Cmd or add files one by one</span>
              </div>
            </div>

            {/* Selected File Chips List */}
            {stegoFiles.length > 0 && (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Selected Stego Files ({stegoFiles.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setStegoFiles([])}
                    className="text-red-500 hover:underline text-[11px]"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stegoFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm"
                    >
                      <FileImage className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate max-w-[160px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-slate-400 hover:text-red-500 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !secretId.trim() || !email.trim() || stegoFiles.length < 2 || !backendOnline}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              {loading ? 'Sending Code...' : 'Request Email Verification Code'}
            </button>
          </>
        ) : (
          <>
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Verification OTP sent to <b>{email}</b> ({role})</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Check your inbox (or backend terminal) for the 6-digit code to complete reconstruction.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength="6"
                required
                placeholder="123456"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-center tracking-widest text-lg font-mono focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl text-sm transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || token.length !== 6}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                {loading ? 'Verifying & Reconstructing...' : 'Verify & Reconstruct Secret'}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Error Banner */}
      <ErrorBanner message={error} />

      {/* Result Output */}
      <ReconstructResult result={result} />
    </div>
  );
}