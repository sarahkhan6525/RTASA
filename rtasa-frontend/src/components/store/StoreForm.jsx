import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Send, FileText, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from './ImageUploader';
import StoreResult from './StoreResult';
import ErrorBanner from '../common/ErrorBanner';
import { storeSecret } from '../../api/secrets';

export default function StoreForm({ backendOnline }) {
  // Mode selection: 'text' or 'file'
  const [secretType, setSecretType] = useState('text');

  // Form fields
  const [title, setTitle] = useState('');
  const [secretText, setSecretText] = useState('');
  const [secretFile, setSecretFile] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [thresholdK, setThresholdK] = useState(2);
  const [totalN, setTotalN] = useState(2);
  const [emails, setEmails] = useState(['', '']);
  const [roles, setRoles] = useState(['Manager', 'Manager']);
  const [coverFiles, setCoverFiles] = useState([null, null]);

  // Request status states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleNChange = (newN) => {
    setTotalN(newN);
    if (thresholdK > newN) setThresholdK(newN);

    const updatedEmails = Array(newN).fill('').map((_, i) => emails[i] || '');
    setEmails(updatedEmails);

    const updatedRoles = Array(newN).fill('Manager').map((_, i) => roles[i] || 'Manager');
    setRoles(updatedRoles);

    const updatedFiles = Array(newN).fill(null).map((_, i) => coverFiles[i] || null);
    setCoverFiles(updatedFiles);
  };

  const handleEmailChange = (index, value) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const handleRoleChange = (index, value) => {
    const updated = [...roles];
    updated[index] = value;
    setRoles(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validation checks
    if (secretType === 'text' && !secretText.trim()) {
      const errMsg = 'Please enter secret text.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (secretType === 'file' && !secretFile) {
      const errMsg = 'Please select a file to store.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    const uploadedImages = coverFiles.filter(Boolean);
    if (uploadedImages.length < totalN) {
      const errMsg = `Please upload all ${totalN} required cover images (1 for each share).`;
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('threshold_k', thresholdK);
      formData.append('total_shares_n', totalN);

      // Append either text or file based on selected mode
      if (secretType === 'text') {
        formData.append('secret_text', secretText);
      } else {
        formData.append('secret_file', secretFile);
      }

      // Build recipient list with roles, only for rows that have an email
      const recipientsWithRoles = emails
        .map((email, idx) => ({
          email: email.trim(),
          role: roles[idx] || 'Manager',
        }))
        .filter((r) => r.email !== '');

      if (recipientsWithRoles.length > 0) {
        // Keep legacy field for backend compatibility
        formData.append(
          'recipient_emails_json',
          JSON.stringify(recipientsWithRoles.map((r) => r.email))
        );
        // New field carrying role info
        formData.append(
          'authorized_recipients_json',
          JSON.stringify(recipientsWithRoles)
        );
      }

      for (let i = 0; i < uploadedImages.length; i++) {
        formData.append('cover_images', uploadedImages[i]);
      }

      const response = await storeSecret(formData);
      setResult(response);
      toast.success('Secret split & stego images generated successfully!');
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || 'Failed to split secret and create stego images.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm transition-colors"
      >
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Secret Configuration
        </h2>

        {/* Toggle between Text and File input */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSecretType('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              secretType === 'text'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Text Secret
          </button>
          <button
            type="button"
            onClick={() => setSecretType('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              secretType === 'file'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" /> Binary File Secret
          </button>
        </div>

        {/* Title Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Secret Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Master Production DB Credential or Secret PDF"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Conditional Input: Secret Text OR File Input */}
        {secretType === 'text' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Secret Content
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                placeholder="Enter sensitive secret text..."
                value={secretText}
                onChange={(e) => setSecretText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Secret File (PDF, DOCX, TXT, ZIP, PNG, etc.)
            </label>
            <input
              type="file"
              onChange={(e) => setSecretFile(e.target.files[0] || null)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 hover:file:bg-blue-100"
            />
          </div>
        )}

        {/* Sliders for Threshold (k) and Total Shares (n) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <label className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Threshold (k) — Min Required</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{thresholdK} shares</span>
            </label>
            <input
              type="range"
              min="2"
              max={totalN}
              value={thresholdK}
              onChange={(e) => setThresholdK(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 dark:accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Total Shares (n) — Generated</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{totalN} shares</span>
            </label>
            <input
              type="range"
              min="2"
              max="10"
              value={totalN}
              onChange={(e) => handleNChange(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 dark:accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Recipient Emails + Roles */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Assign Recipient Email & Role per Share (Optional Delivery)
          </label>
          <div className="space-y-3">
            {emails.map((email, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 sm:w-20 shrink-0">
                  Share #{idx + 1}
                </span>

                <input
                  type="email"
                  placeholder={`recipient${idx + 1}@email.com`}
                  value={email}
                  onChange={(e) => handleEmailChange(idx, e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />

                <select
                  value={roles[idx] || 'Manager'}
                  onChange={(e) => handleRoleChange(idx, e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                >
                  <option value="Manager">Manager</option>
                  <option value="IT Officer">IT Officer</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Image Uploader */}
        <ImageUploader
          totalN={totalN}
          coverFiles={coverFiles}
          setCoverFiles={setCoverFiles}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !backendOnline}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Splitting Secret & Embedding Shares...' : 'Split Secret & Distribute Shares'}
        </button>
      </form>

      {/* Error Banner */}
      <ErrorBanner message={error} />

      {/* Store Result */}
      <StoreResult result={result} />
    </div>
  );
}