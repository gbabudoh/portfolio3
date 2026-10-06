import { refreshSite } from '@/lib/revalidate';
import { getDatabase } from '@/lib/database';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { company, position, description, start_date, end_date, current, technologies, achievements } = body;
    
    const db = getDatabase();
    const result = db.prepare(
      'UPDATE experience SET company = ?, position = ?, description = ?, start_date = ?, end_date = ?, current = ?, technologies = ?, achievements = ? WHERE id = ?'
    ).run(company, position, description, start_date, end_date || null, current ? 1 : 0, technologies || "", achievements || "", id);
    
    if (result.changes > 0) {
      refreshSite();
      return Response.json({ success: true, message: 'Experience updated successfully' });
    } else {
      return Response.json({ success: false, error: 'Experience not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating experience:', error);
    return Response.json({ success: false, error: 'Failed to update experience' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const db = getDatabase();
    const result = db.prepare('DELETE FROM experience WHERE id = ?').run(id);
    
    if (result.changes > 0) {
      refreshSite();
      return Response.json({ success: true, message: 'Experience deleted successfully' });
    } else {
      return Response.json({ success: false, error: 'Experience not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting experience:', error);
    return Response.json({ success: false, error: 'Failed to delete experience' }, { status: 500 });
  }
}
