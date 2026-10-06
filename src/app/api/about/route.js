import { refreshSite } from '@/lib/revalidate';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    
    const aboutContent = db.prepare('SELECT * FROM about_content ORDER BY id').all();
    
    return Response.json({
      success: true,
      data: aboutContent
    });
  } catch (error) {
    console.error('Error fetching about content:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch about content' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { section, title, content } = body;
    
    if (!section || !content) {
      return Response.json({ 
        success: false, 
        error: 'Section and content are required' 
      }, { status: 400 });
    }
    
    const db = getDatabase();
    
    // Check if section already exists
    const existing = db.prepare('SELECT id FROM about_content WHERE section = ?').get(section);
    
    if (existing) {
      // Update existing section
      db.prepare('UPDATE about_content SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE section = ?')
        .run(title, content, section);
    } else {
      // Insert new section
      db.prepare('INSERT INTO about_content (section, title, content) VALUES (?, ?, ?)')
        .run(section, title, content);
    }
    
    refreshSite();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating about content:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update about content' 
    }, { status: 500 });
  }
}
