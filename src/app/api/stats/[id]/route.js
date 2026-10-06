import { refreshSite } from '@/lib/revalidate';
import { getDatabase } from '@/lib/database';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { key, value, label, color, display_order } = body;
    
    const db = getDatabase();
    const result = db.prepare(
      'UPDATE stats SET key = ?, value = ?, label = ?, color = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(key, value, label, color, display_order, id);
    
    if (result.changes > 0) {
      refreshSite();
      return Response.json({ success: true, message: 'Stat updated successfully' });
    } else {
      return Response.json({ success: false, error: 'Stat not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating stat:', error);
    return Response.json({ success: false, error: 'Failed to update stat' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const db = getDatabase();
    const result = db.prepare('DELETE FROM stats WHERE id = ?').run(id);
    
    if (result.changes > 0) {
      refreshSite();
      return Response.json({ success: true, message: 'Stat deleted successfully' });
    } else {
      return Response.json({ success: false, error: 'Stat not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting stat:', error);
    return Response.json({ success: false, error: 'Failed to delete stat' }, { status: 500 });
  }
}

