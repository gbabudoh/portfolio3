import { refreshSite } from '@/lib/revalidate';
import { getSocialLinks, saveSocialLinks } from '@/lib/settings';

// Admin only — enforced by middleware (/api/socials is not in the public allow-list).
export async function GET() {
  try {
    return Response.json({ success: true, data: getSocialLinks() });
  } catch (error) {
    console.error('Error reading social links:', error);
    return Response.json({ success: false, error: 'Failed to load social links' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const result = saveSocialLinks(body?.links);
    if (result.errors) {
      return Response.json(
        { success: false, error: 'Please fix the highlighted links.', errors: result.errors },
        { status: 400 }
      );
    }
    refreshSite(); // footer, contact page and structured data
    return Response.json({ success: true, data: result.values });
  } catch (error) {
    console.error('Error saving social links:', error);
    return Response.json({ success: false, error: 'Failed to save social links' }, { status: 500 });
  }
}
