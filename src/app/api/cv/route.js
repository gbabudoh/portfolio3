import cloudinary from '@/lib/cloudinary';
import { refreshSite } from '@/lib/revalidate';
import { clearCv, getCv, saveCv } from '@/lib/settings';

// Admin only — enforced by middleware (/api/cv is not in the public allow-list).

const MAX_BYTES = 5 * 1024 * 1024;

function isPdf(buffer) {
  // Every PDF starts with "%PDF-" — check the bytes, not just the filename or MIME type.
  return buffer.length > 5 && buffer.subarray(0, 5).toString('latin1') === '%PDF-';
}

function destroy(publicId) {
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId, { resource_type: 'raw', invalidate: true }).catch((error) => {
    console.warn('Could not delete previous CV from Cloudinary:', error?.message);
  });
}

export async function GET() {
  return Response.json({ success: true, data: getCv() });
}

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return Response.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ success: false, error: 'The PDF must be 5 MB or smaller.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isPdf(buffer)) {
      return Response.json({ success: false, error: 'That file isn’t a valid PDF.' }, { status: 400 });
    }

    // Uploaded as a "raw" asset: delivered as-is, and not subject to Cloudinary's
    // image-PDF delivery restriction. A unique name per upload avoids stale CDN caches.
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'raw',
            folder: 'portfolio/cv',
            public_id: `cv-${Date.now()}.pdf`,
            overwrite: false,
          },
          (error, uploaded) => (error ? reject(error) : resolve(uploaded))
        )
        .end(buffer);
    });

    const previous = getCv();
    saveCv({ url: result.secure_url, publicId: result.public_id, bytes: result.bytes });
    await destroy(previous?.publicId);

    refreshSite(); // nav shows/hides the CV link
    return Response.json({ success: true, data: getCv() });
  } catch (error) {
    console.error('CV upload error:', error);
    return Response.json({ success: false, error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const current = getCv();
    clearCv();
    await destroy(current?.publicId);
    refreshSite();
    return Response.json({ success: true, data: null });
  } catch (error) {
    console.error('CV delete error:', error);
    return Response.json({ success: false, error: 'Failed to remove CV.' }, { status: 500 });
  }
}
