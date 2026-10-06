import { getAnalyticsSummary } from '@/lib/insights';

// Admin only — enforced by middleware.
export async function GET() {
  try {
    return Response.json({ success: true, data: getAnalyticsSummary() });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return Response.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
