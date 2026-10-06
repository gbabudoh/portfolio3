import { refreshSite } from '@/lib/revalidate';
import { getDatabase } from '@/lib/database';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, long_description, image_url, image_public_id, live_url, github_url, technologies, technical_skills, category, featured } = body;
    
    const db = getDatabase();
    const result = db.prepare(
      'UPDATE projects SET title = ?, description = ?, long_description = ?, image_url = ?, image_public_id = ?, live_url = ?, github_url = ?, technologies = ?, technical_skills = ?, category = ?, featured = ? WHERE id = ?'
    ).run(title, description, long_description, image_url, image_public_id, live_url, github_url, technologies, technical_skills || '', category, featured ? 1 : 0, id);
    
    if (result.changes > 0) {
      refreshSite();
      return Response.json({ success: true, message: 'Project updated successfully' });
    } else {
      return Response.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating project:', error);
    return Response.json({ success: false, error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const db = getDatabase();
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    
    if (result.changes > 0) {
      refreshSite();
      return Response.json({ success: true, message: 'Project deleted successfully' });
    } else {
      return Response.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    return Response.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
  }
}
