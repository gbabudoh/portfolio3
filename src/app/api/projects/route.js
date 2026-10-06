import { refreshSite } from '@/lib/revalidate';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    const projects = db.prepare('SELECT * FROM projects ORDER BY featured DESC, created_at DESC').all();
    
    return Response.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return Response.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, long_description, image_url, image_public_id, live_url, github_url, technologies, technical_skills, category, featured } = body;
    
    // Validate required fields
    if (!title || !description || !category) {
      return Response.json({ success: false, error: 'Title, description, and category are required' }, { status: 400 });
    }
    
    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO projects (title, description, long_description, image_url, image_public_id, live_url, github_url, technologies, technical_skills, category, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(title, description, long_description || '', image_url || '', image_public_id || '', live_url || '', github_url || '', technologies || '', technical_skills || '', category, featured ? 1 : 0);
    
    refreshSite();
    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating project:', error);
    return Response.json({ success: false, error: 'Failed to create project' }, { status: 500 });
  }
}
