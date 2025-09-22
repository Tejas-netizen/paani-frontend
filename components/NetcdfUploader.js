'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function NetcdfUploader({ onIngest }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setStatus('idle');
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setMessage('Uploading and parsing NetCDF...');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingest/netcdf`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
      setStatus('success');
      setMessage(`Ingested float ${data.data?.float?.float_id || ''} with ${data.data?.insertedProfiles || 0} profiles.`);
      onIngest && onIngest(data);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to upload');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <UploadCloud className="h-5 w-5 text-ocean-600" />
          <h3 className="text-lg font-semibold text-gray-900">Upload ARGO NetCDF</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <input
          type="file"
          accept=".nc,application/x-netcdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-ocean-50 file:text-ocean-700 hover:file:bg-ocean-100"
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="px-3 py-2 bg-ocean-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ocean-700 transition-colors text-sm"
          >
            {status === 'uploading' ? 'Uploading...' : 'Upload & Ingest'}
          </button>
          {status === 'success' && (
            <span className="flex items-center text-green-700 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Success
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center text-red-700 text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" /> Failed
            </span>
          )}
        </div>
        {message && (
          <p className="text-xs text-gray-600">{message}</p>
        )}
        <p className="text-xs text-gray-500">Select a .nc file (e.g., the one at your path) and click Upload & Ingest. Newly ingested floats will appear after Refresh.</p>
      </div>
    </div>
  );
}


