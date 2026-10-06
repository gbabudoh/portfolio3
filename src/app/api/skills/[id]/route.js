import { refreshSite } from '@/lib/revalidate';
import { getDatabase } from '@/lib/database';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, proficiency, icon, description } = body;
    
    const db = getDatabase();
    const result = db.prepare(
      'UPDATE skills SET name = ?, category = ?, proficiency = ?, icon = ?, description = ? WHERE id = ?'
    ).run(name, category, proficiency, icon, description, id);
    
    if (result.changes > 0) {
      refreshSite();
      return Response.json({ success: true, message: 'Skill updated successfully' });
    } else {
      return Response.json({ success: false, error: 'Skill not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating skill:', error);
    return Response.json({ success: false, error: 'Failed to update skill' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const db = getDatabase();
    const result = db.prepare('DELETE FROM skills WHERE id = ?').run(id);
    
    if (result.changes > 0) {
      refreshSite();
      return Response.json({ success: true, message: 'Skill deleted successfully' });
    } else {
      return Response.json({ success: false, error: 'Skill not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting skill:', error);
    return Response.json({ success: false, error: 'Failed to delete skill' }, { status: 500 });
  }
}
