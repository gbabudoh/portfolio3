import { refreshSite } from '@/lib/revalidate';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    const skills = db.prepare('SELECT * FROM skills ORDER BY category, proficiency DESC').all();
    
    return Response.json({ success: true, data: skills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return Response.json({ success: false, error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, proficiency, icon, description } = body;
    
    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO skills (name, category, proficiency, icon, description) VALUES (?, ?, ?, ?, ?)'
    ).run(name, category, proficiency, icon, description);
    
    refreshSite();
    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating skill:', error);
    return Response.json({ success: false, error: 'Failed to create skill' }, { status: 500 });
  }
}
