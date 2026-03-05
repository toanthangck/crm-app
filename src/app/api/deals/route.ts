import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';

export async function GET(request: Request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const stage = searchParams.get('stage') || '';
        const search = searchParams.get('search') || '';

        let query = `
      SELECT d.*, c.first_name || ' ' || c.last_name as contact_name, co.name as company_name, u.name as owner_name
      FROM deals d
      LEFT JOIN contacts c ON d.contact_id = c.id
      LEFT JOIN companies co ON d.company_id = co.id
      LEFT JOIN users u ON d.owner_id = u.id
    `;
        const conditions: string[] = [];
        const params: any[] = [];

        if (stage) {
            conditions.push('d.stage = ?');
            params.push(stage);
        }
        if (search) {
            conditions.push('(d.title LIKE ? OR d.description LIKE ?)');
            const s = `%${search}%`;
            params.push(s, s);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY d.created_at DESC';

        const deals = db.prepare(query).all(...params);
        return NextResponse.json(deals);
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
      INSERT INTO deals (id, title, value, stage, contact_id, company_id, owner_id, expected_close, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.title, data.value || 0, data.stage || 'lead', data.contact_id || null, data.company_id || null, data.owner_id || null, data.expected_close || null, data.description || null);

        const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(id);
        return NextResponse.json(deal, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
