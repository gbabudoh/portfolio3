import { getDatabase } from '@/lib/database';

const LIMITS = { name: 120, email: 200, subject: 200, message: 5000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();

    // Honeypot field: real visitors never see it, so a value means a bot.
    // Respond as if it worked so bots don't learn to adapt.
    if (body.company) {
      return Response.json({ success: true });
    }

    const fields = {};
    for (const key of Object.keys(LIMITS)) {
      fields[key] = typeof body[key] === 'string' ? body[key].trim() : '';
    }

    if (Object.values(fields).some((v) => !v)) {
      return Response.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }
    if (!EMAIL_PATTERN.test(fields.email)) {
      return Response.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    for (const [key, max] of Object.entries(LIMITS)) {
      if (fields[key].length > max) {
        return Response.json({ success: false, error: `${key} is too long.` }, { status: 400 });
      }
    }

    const db = getDatabase();
    const result = db
      .prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)')
      .run(fields.name, fields.email, fields.subject, fields.message);

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return Response.json({ success: false, error: 'Failed to save message' }, { status: 500 });
  }
}

// Admin only — enforced by middleware.
export async function GET() {
  try {
    const db = getDatabase();
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
    return Response.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return Response.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}
