import cloudinary from '@/lib/cloudinary';
import { site } from '@/lib/site';
import { getCv, recordCvDownload } from '@/lib/settings';

// Permanent public link to the current CV (e.g. https://…/cv).
// Streams the PDF from Cloudinary so it opens inline with a clean filename,
// and counts each open as a download for the admin.
export const dynamic = 'force-dynamic';

function sourceUrl(cv) {
  // Many Cloudinary accounts block public PDF delivery, so fetch through the
  // authenticated download API. The signed URL is only ever used server-side.
  if (cv.publicId) {
    return cloudinary.utils.private_download_url(cv.publicId, '', { resource_type: 'raw', type: 'upload' });
  }
  return cv.url;
}

export async function GET() {
  const cv = getCv();
  if (!cv) {
    return new Response('CV not available', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }

  const upstream = await fetch(sourceUrl(cv), { cache: 'no-store' }).catch(() => null);
  if (!upstream?.ok || !upstream.body) {
    console.error('CV fetch failed:', upstream?.status);
    return new Response('CV temporarily unavailable', { status: 502, headers: { 'Content-Type': 'text/plain' } });
  }

  try {
    recordCvDownload();
  } catch (error) {
    console.warn('Could not record CV download:', error?.message);
  }

  const filename = `${site.fullName.replace(/[^A-Za-z0-9]+/g, '-')}-CV.pdf`;
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
