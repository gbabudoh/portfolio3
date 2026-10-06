import { refreshSite } from '@/lib/revalidate';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    const stats = db.prepare('SELECT * FROM stats ORDER BY display_order ASC').all();
    
    return Response.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return Response.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { key, value, label, color, display_order } = body;
    
    if (!key || !value || !label) {
      return Response.json({ success: false, error: 'Key, value, and label are required' }, { status: 400 });
    }
    
    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO stats (key, value, label, color, display_order) VALUES (?, ?, ?, ?, ?)'
    ).run(key, value, label, color || 'blue', display_order || 0);
    
    refreshSite();
    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating stat:', error);
    return Response.json({ success: false, error: 'Failed to create stat' }, { status: 500 });
  }
}

