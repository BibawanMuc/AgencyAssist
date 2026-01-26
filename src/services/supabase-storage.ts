import { supabase } from '../config/supabase';

const BUCKET_NAME = 'generated_assets';

/**
 * Upload a file (Blob/File/Base64) to Supabase Storage
 * Returns the Public URL of the uploaded file.
 */
export async function uploadFile(
    file: File | Blob,
    path: string
): Promise<string> {
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        throw error;
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return publicUrl;
}

/**
 * Upload a Base64 string as an image
 */
export async function uploadBase64Image(
    base64Data: string,
    path: string
): Promise<string> {
    // Convert Base64 to Blob
    const byteString = atob(base64Data.split(',')[1]);
    const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });

    return uploadFile(blob, path);
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

    if (error) {
        throw error;
    }
}

/**
 * Generate a unique path for assets
 */
export function generateAssetPath(prefix: string, ext: string = 'png'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}/${timestamp}_${random}.${ext}`;
}
