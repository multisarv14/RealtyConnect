/** Uploading and opening real files stored by the server (PDF, PNG, JPEG). */

import { api, apiFetch, ApiError } from './api';

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'scanning' | 'success' | 'failed';
}

export const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg'];

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Uploads one file and waits until it has cleared the server's checks (so it can be opened by others). */
export async function uploadFile(file: File): Promise<StoredFile> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(extension)) throw new Error('Only PDF, PNG and JPEG files can be uploaded.');
  const form = new FormData();
  form.append('file', file, file.name);
  const res = await apiFetch('/files', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.error || 'Upload failed.', data);
  let stored = data as StoredFile;
  for (let i = 0; i < 30 && stored.status === 'scanning'; i++) {
    await new Promise(r => setTimeout(r, 1000));
    stored = await api<StoredFile>('GET', `/files/${stored.id}`);
  }
  if (stored.status !== 'success') throw new Error('The file did not pass the security checks.');
  return stored;
}

/** Opens a stored file in a new tab. */
export async function openFile(fileId: string): Promise<boolean> {
  const res = await apiFetch(`/files/${encodeURIComponent(fileId)}/download`);
  if (!res.ok) return false;
  const url = URL.createObjectURL(await res.blob());
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

export async function saveFile(fileId: string, name: string): Promise<boolean> {
  const res = await apiFetch(`/files/${encodeURIComponent(fileId)}/download`);
  if (!res.ok) return false;
  const url = URL.createObjectURL(await res.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
