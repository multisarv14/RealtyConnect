/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  UploadCloud, 
  File, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Trash2, 
  Download,
  ShieldCheck, 
  ShieldAlert,
  Info 
} from 'lucide-react';
import { UploadedFile } from '../types';
import { api, apiFetch, ApiError, errorMessage } from '../lib/api';

interface FileUploaderProps {
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  onNotificationTriggered: (type: 'email' | 'sms' | 'push' | 'in_app', content: string) => void;
  userSession: { id: string } | null;
  maxSizeMb: number;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function FileUploader({ onLogTriggered, onNotificationTriggered, userSession, maxSizeMb, showToast }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(() => {
    api<UploadedFile[]>('GET', '/files')
      .then(setFiles)
      .catch(err => showToast(errorMessage(err), 'error'));
  }, [showToast]);

  useEffect(() => {
    if (userSession) loadFiles();
    else setFiles([]);
  }, [userSession?.id, loadFiles]);

  // Files leave quarantine on the server; keep asking while any is still being scanned.
  const hasScanning = files.some(f => f.status === 'scanning');
  useEffect(() => {
    if (!hasScanning) return;
    const timer = setInterval(loadFiles, 1500);
    return () => clearInterval(timer);
  }, [hasScanning, loadFiles]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadToServer = async (content: Blob, name: string): Promise<UploadedFile> => {
    const form = new FormData();
    form.append('file', content, name);
    const res = await apiFetch('/files', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data?.error || 'Upload failed.', data);
    return data as UploadedFile;
  };

  const processFile = async (file: File) => {
    if (!userSession) {
      showToast('Sign in to upload documents.', 'info');
      return;
    }

    // 1. Validation - File Extension (the server re-checks the actual file content)
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (!allowedExtensions.includes(extension)) {
      onLogTriggered(
        'SECURITY_FILE_REJECTED_UNSUPPORTED_TYPE',
        'uploaded_files',
        file.name,
        'FAILURE',
        `File upload aborted: Extension ".${extension}" is unsupported. Whitelist limits to: PDF, PNG, JPG.`
      );
      showToast(`Upload Blocked: Unsupported file type. Only PDF, PNG, JPG, and JPEG documents are permitted under Rule FILE-01.`, 'error');
      return;
    }

    // 2. Validation - File Size
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      onLogTriggered(
        'SECURITY_FILE_REJECTED_SIZE_LIMIT',
        'uploaded_files',
        file.name,
        'FAILURE',
        `File upload aborted: File size of ${formatBytes(file.size)} exceeds configured maximum threshold limit of ${maxSizeMb}MB.`
      );
      showToast(`Upload Blocked: File size exceeds the active platform limit of ${maxSizeMb}MB.`, 'error');
      return;
    }

    // 3. Upload into quarantine
    try {
      const uploaded = await uploadToServer(file, file.name);
      setFiles(prev => [uploaded, ...prev]);
      onNotificationTriggered('in_app', `File "${file.name}" uploaded. It is held in quarantine until the scan completes.`);
    } catch (err) {
      showToast(`Upload failed: ${errorMessage(err)}`, 'error');
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void processFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  // Sends an executable straight to the API, skipping the browser-side checks above,
  // to prove the server's own gate (Rule FILE-01) holds.
  const sendDisguisedExecutable = async () => {
    if (!userSession) {
      showToast('Sign in to run the server-side rejection test.', 'info');
      return;
    }
    const payload = new Blob([new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00])], { type: 'application/x-msdownload' });
    try {
      await uploadToServer(payload, 'critical_exploit_payload.exe');
      loadFiles();
      showToast('Unexpected: the server accepted an executable payload. Review the upload gate.', 'error');
    } catch (err) {
      showToast(`Server gate held: ${errorMessage(err)}`, 'success');
    }
  };

  const handleDownloadFile = async (file: UploadedFile) => {
    const res = await apiFetch(`/files/${encodeURIComponent(file.id)}/download`).catch(() => null);
    if (!res || !res.ok) {
      showToast('Download failed. The file may still be in quarantine.', 'error');
      return;
    }
    const url = URL.createObjectURL(await res.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteFile = (id: string) => {
    api('DELETE', `/files/${encodeURIComponent(id)}`)
      .then(() => setFiles(prev => prev.filter(f => f.id !== id)))
      .catch(err => showToast(errorMessage(err), 'error'));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="file-uploader-root">
      {/* File Drop zone */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <span className="text-[10px] text-slate-500 font-mono block uppercase px-1 tracking-wider">Secure Document Upload Interface</span>
        
        {/* Drag and Drop Container */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Upload file - Drag and drop a file or press Enter to browse"
          id="drag-drop-zone"
          className={`flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none min-h-[180px] transition-all focus:outline-none focus:border-emerald-500 focus:bg-emerald-500/5 ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-500/5' 
              : 'border-slate-800 hover:border-slate-750 bg-slate-900/10 hover:bg-slate-900/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <UploadCloud className={`w-10 h-10 mb-3.5 transition-colors ${dragActive ? 'text-emerald-400' : 'text-slate-600'}`} />
          <p className="text-sm font-semibold text-slate-200">Drag & Drop file here, or click to browse</p>
          <p className="text-[10px] text-slate-500 font-mono mt-1.5 uppercase">
            PDF, PNG, JPG, JPEG only (Max size: {maxSizeMb}MB)
          </p>
        </div>

        {/* Security Drill Test Trigger Box */}
        <div className="p-3.5 bg-slate-900/10 border border-slate-850 rounded-xl">
          <h4 className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            Security Intrusion Testbed
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Send an executable past the browser-side checks to confirm the server rejects it on its own.
          </p>
          <button
            onClick={sendDisguisedExecutable}
            id="btn-simulate-malware"
            className="w-full bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/60 text-red-400 font-mono font-bold py-1.5 px-3 rounded text-xs transition-all flex items-center justify-center gap-1.5"
          >
            Send Disguised EXE to Server
          </button>
        </div>
      </div>

      {/* Uploaded File Registry list */}
      <div className="lg:col-span-7 p-5 bg-slate-900/30 border border-slate-800 rounded-xl flex flex-col justify-between" id="file-registry-dashboard">
        <div>
          <h3 className="font-display font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-900">
            <File className="w-4 h-4 text-emerald-400" />
            Active Document & File Registry
          </h3>

          {/* Files container */}
          <div className="space-y-2 mt-4 max-h-[195px] overflow-y-auto pr-1">
            {files.length === 0 ? (
              <div className="py-10 text-center text-slate-550 text-xs font-mono">
                {userSession ? 'No documents uploaded yet.' : 'Sign in to upload and view documents.'}
              </div>
            ) : (
              files.map(file => {
                const isScanning = file.status === 'scanning';
                const isSuccess = file.status === 'success';
                const isFailed = file.status === 'failed';

                return (
                  <div 
                    key={file.id}
                    id={`file-row-${file.id}`}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3.5 transition-all ${
                      isFailed 
                        ? 'bg-red-950/15 border-red-900/40 text-red-350' 
                        : isScanning 
                        ? 'bg-slate-950/50 border-slate-850' 
                        : 'bg-slate-950 border-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded mt-0.5 ${
                        isFailed ? 'bg-red-500/10 text-red-400' : isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {isFailed ? <ShieldAlert className="w-4 h-4" /> : isSuccess ? <ShieldCheck className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                      </div>
                      
                      <div className="min-w-0">
                        <span className="font-medium text-xs text-slate-200 block truncate" title={file.name}>{file.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono text-slate-500">{formatBytes(file.size)}</span>
                          <span className="text-[9px] text-slate-650">•</span>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">{file.type}</span>
                          <span className="text-[9px] text-slate-650">•</span>
                          <span className="text-[9px] font-mono text-slate-500 truncate max-w-[100px]" title={`MD5: ${file.md5}`}>MD5:{file.md5.substr(0,8)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isScanning && (
                        <span className="text-[10px] font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1">
                          Scanning
                        </span>
                      )}
                      {isSuccess && (
                        <>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                            Secure
                          </span>
                          <button
                            onClick={() => handleDownloadFile(file)}
                            id={`btn-download-file-${file.id}`}
                            className="text-slate-600 hover:text-emerald-400 p-1 rounded hover:bg-slate-900 transition-colors"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            id={`btn-delete-file-${file.id}`}
                            className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-colors"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {isFailed && (
                        <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1 font-bold">
                          Threat Quarantined
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Warning Policy info box */}
        <div className="mt-5 p-3.5 bg-slate-900/20 border border-slate-850 rounded-lg text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Quarantine Policy (Rule FILE-03):</strong> Files are blocked from download while in quarantine. The server verifies type and size; an antivirus engine is not connected yet, so files are released after a short hold.
          </span>
        </div>
      </div>
    </div>
  );
}
