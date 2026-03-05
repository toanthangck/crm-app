import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';

export async function GET(request: Request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || '';
        const type = searchParams.get('type') || '';

        let query = `
      SELECT a.*, u.name as user_name, 
        c.first_name || ' ' || c.last_name as contact_name,
        d.title as deal_title
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN contacts c ON a.contact_id = c.id
      LEFT JOIN deals d ON a.deal_id = d.id
    `;
        const conditions: string[] = [];
        const params: any[] = [];

        if (status) { conditions.push('a.status = ?'); params.push(status); }
        if (type) { conditions.push('a.type = ?'); params.push(type); }

        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY a.due_date ASC, a.created_at DESC';

        const activities = db.prepare(query).all(...params);
        return NextResponse.json(activities);
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const db = getDb();
        const data = await request.json();
        const id = uuidv4();

        db.prepare(`
      INSERT INTO activities (id, type, title, description, contact_id, deal_id, company_id, user_id, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.type, data.title, data.description || null, data.contact_id || null, data.deal_id || null, data.company_id || null, data.user_id || null, data.due_date || null, data.status || 'todo');

        const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
        return NextResponse.json(activity, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
