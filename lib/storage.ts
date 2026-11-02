// Server-only helpers for the private Supabase Storage bucket that holds case files.
import { getServiceSupabase } from './supabase';
import { MAX_FILE_BYTES } from './files';

export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'case-documents';

let bucketReady = false;

/** Create the PRIVATE bucket on first use if it does not exist yet. */
export async function ensureBucket(): Promise<boolean> {
  if (bucketReady) return true;
  const supabase = getServiceSupabase();
  const { data } = await supabase.storage.getBucket(STORAGE_BUCKET);
  if (!data) {
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: false, fileSizeLimit: MAX_FILE_BYTES });
    if (error && !/already exists/i.test(error.message)) {
      console.error('Could not create storage bucket:', error.message);
      return false;
    }
  }
  bucketReady = true;
  return true;
}

/** Short-lived (60 s) download link for a private file. */
export async function signedDownloadUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await getServiceSupabase().storage.from(STORAGE_BUCKET).createSignedUrl(storagePath, 60);
  if (error || !data) return null;
  return data.signedUrl;
}
