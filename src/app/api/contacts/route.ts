import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';

export async function GET(request: Request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const company = searchParams.get('company') || '';

        let query = `
      SELECT c.*, co.name as company_name, u.name as owner_name
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      LEFT JOIN users u ON c.owner_id = u.id
    `;
        const conditions: string[] = [];
        const params: any[] = [];

        if (search) {
            conditions.push(`(c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)`);
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }
        if (company) {
            conditions.push(`c.company_id = ?`);
            params.push(company);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY c.created_at DESC';

        const contacts = db.prepare(query).all(...params);
        return NextResponse.json(contacts);
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
      INSERT INTO contacts (id, first_name, last_name, email, phone, position, company_id, owner_id, tags, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.first_name, data.last_name, data.email || null, data.phone || null, data.position || null, data.company_id || null, data.owner_id || null, JSON.stringify(data.tags || []), data.notes || null);

        const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
        return NextResponse.json(contact, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
