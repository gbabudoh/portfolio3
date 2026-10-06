import { getDatabase } from '@/lib/database';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return Response.json({ success: false, error: 'Message ID is required' }, { status: 400 });
    }
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return Response.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { read } = body;
    
    if (typeof read !== 'boolean') {
      return Response.json({ success: false, error: 'Read field must be a boolean' }, { status: 400 });
    }
    
    // Convert boolean to integer for SQLite
    const readValue = read ? 1 : 0;
    
    const db = getDatabase();
    const result = db.prepare(
      'UPDATE contact_messages SET read = ? WHERE id = ?'
    ).run(readValue, parseInt(id));
    
    if (result.changes > 0) {
      return Response.json({ success: true, message: 'Message updated successfully' });
    } else {
      return Response.json({ success: false, error: 'Message not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating message:', error);
    return Response.json({ success: false, error: 'Failed to update message: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const db = getDatabase();
    const result = db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
    
    if (result.changes > 0) {
      return Response.json({ success: true, message: 'Message deleted successfully' });
    } else {
      return Response.json({ success: false, error: 'Message not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    return Response.json({ success: false, error: 'Failed to delete message' }, { status: 500 });
  }
}
