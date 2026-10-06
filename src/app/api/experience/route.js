import { refreshSite } from '@/lib/revalidate';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    const experience = db.prepare('SELECT * FROM experience ORDER BY start_date DESC').all();
    
    return Response.json({ success: true, data: experience });
  } catch (error) {
    console.error('Error fetching experience:', error);
    return Response.json({ success: false, error: 'Failed to fetch experience' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { company, position, description, start_date, end_date, current, technologies, achievements } = body;
    
    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO experience (company, position, description, start_date, end_date, current, technologies, achievements) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(company, position, description, start_date, end_date || null, current ? 1 : 0, technologies || "", achievements || "");
    
    refreshSite();
    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating experience:', error);
    return Response.json({ success: false, error: 'Failed to create experience' }, { status: 500 });
  }
}
