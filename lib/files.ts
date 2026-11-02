// Upload rules for case files (pure functions, covered by tests).
export const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB (stays under the Vercel 4.5 MB request limit)

const ALLOWED: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'text/plain': ['txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
};

export const ACCEPT_ATTRIBUTE = '.pdf,.png,.jpg,.jpeg,.txt,.docx';

/** Returns an error message, or null when the file is acceptable. */
export function validateUpload(name: string, type: string, size: number): string | null {
  if (!name) return 'Choose a file to upload.';
  if (!Number.isFinite(size) || size <= 0) return 'The file is empty.';
  if (size > MAX_FILE_BYTES) return `The file is too large (maximum ${MAX_FILE_BYTES / 1024 / 1024} MB).`;
  const extensions = ALLOWED[type];
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (!extensions || !extensions.includes(ext)) return 'Allowed file types: PDF, PNG, JPG, TXT, DOCX.';
  return null;
}

/** Strip any path and unsafe characters; keep the name readable and bounded. */
export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() || 'file';
  const cleaned = base.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^\.+/, '').slice(-100);
  return cleaned || 'file';
}

export function buildStoragePath(caseId: number, uniqueId: string, fileName: string): string {
  return `cases/${caseId}/${uniqueId}-${safeFileName(fileName)}`;
}
