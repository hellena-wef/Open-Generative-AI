// MuAPI rejects uploads over 10 MB. Big photos (phone shots, 4K renders) are re-encoded
// in the browser before upload: first as high-quality JPEG at full size, then smaller
// until they fit. Files already under the limit, and non-images, pass through untouched.
export const UPLOAD_LIMIT_BYTES = 9.5 * 1024 * 1024; // a little under 10 MB
const MAX_SIDE = 4096; // larger than any model input; keeps the canvas manageable

// Reference images: models read them at ~1-2k px, and a slow home uplink takes over a minute
// per raw phone photo. Over REF_SOFT_LIMIT_BYTES they are resized to REF_MAX_SIDE first.
export const REF_SOFT_LIMIT_BYTES = 1.5 * 1024 * 1024;
export const REF_MAX_SIDE = 2048;

export async function shrinkImageForUpload(file, limit = UPLOAD_LIMIT_BYTES, maxSide = MAX_SIDE) {
    if (!file?.type?.startsWith('image/') || file.size <= limit || file.type === 'image/gif') return file;

    const bitmap = await createImageBitmap(file);
    try {
        let scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
        for (let attempt = 0; attempt < 6; attempt++) {
            const w = Math.round(bitmap.width * scale);
            const h = Math.round(bitmap.height * scale);
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
            const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
            if (blob && blob.size <= limit) {
                const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
                return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
            }
            scale *= 0.8;
        }
    } finally {
        bitmap.close?.();
    }
    return file; // could not get under the limit; let the server explain
}
