import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';

export async function POST(request: Request) {
    try {
        const db = getDb();
        const data = await request.json();
        const id = uuidv4();

        db.prepare(`
      INSERT INTO notes (id, content, contact_id, deal_id, company_id, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.content, data.contact_id || null, data.deal_id || null, data.company_id || null, data.user_id || null);

        const note = db.prepare('SELECT n.*, u.name as user_name FROM notes n LEFT JOIN users u ON n.user_id = u.id WHERE n.id = ?').get(id);
        return NextResponse.json(note, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
