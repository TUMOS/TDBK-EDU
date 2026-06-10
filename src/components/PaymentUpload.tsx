import React, { useState } from 'react';
import { Upload, FileText, Check } from 'lucide-react';

export default function PaymentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploadState('uploading');
    // Simulate upload
    setTimeout(() => {
      setUploadState('success');
      setFile(null);
      setTimeout(() => setUploadState('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs space-y-3">
      <h4 className="text-xs font-bold text-slate-800">Upload Payment Proof</h4>
      <p className="text-[10px] text-slate-400 leading-tight">Attach screenshot or receipt for fast reconciliation.</p>
      
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          onChange={handleFileChange}
          className="text-xs text-slate-600 block w-full
                     file:mr-4 file:py-1 file:px-2
                     file:rounded-full file:border-0
                     file:text-[10px] file:font-semibold
                     file:bg-purple-50 file:text-purple-700
                     hover:file:bg-purple-100"
        />
      </div>
        
      {file && (
        <div className="text-[10px] text-slate-600 bg-gray-50 p-2 rounded flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          {file.name}
        </div>
      )}

      <button 
        onClick={handleUpload}
        disabled={!file || uploadState === 'uploading'}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-[10px] py-1.5 rounded-lg transition flex items-center justify-center gap-1.5"
      >
        {uploadState === 'uploading' ? 'Uploading...' : uploadState === 'success' ? 'Uploaded!' : 'Upload Proof'}
        {uploadState === 'success' && <Check className="h-3.5 w-3.5" />}
        {uploadState === 'idle' && <Upload className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
