import { refreshSite } from '@/lib/revalidate';
import { getIntegrationSettings, saveIntegrationSettings } from '@/lib/settings';

// Admin only — enforced by middleware (not in the public API allow-list).
export async function GET() {
  try {
    return Response.json({ success: true, data: getIntegrationSettings() });
  } catch (error) {
    console.error('Error reading settings:', error);
    return Response.json({ success: false, error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const result = saveIntegrationSettings(body || {});
    if (result.errors) {
      return Response.json(
        { success: false, error: Object.values(result.errors)[0], errors: result.errors },
        { status: 400 }
      );
    }
    // Tracking tags live in the public layout, so re-render the cached pages.
    refreshSite();
    return Response.json({ success: true, data: result.values });
  } catch (error) {
    console.error('Error saving settings:', error);
    return Response.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
