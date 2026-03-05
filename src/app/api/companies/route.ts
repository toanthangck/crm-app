import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';

export async function GET(request: Request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let query = 'SELECT * FROM companies';
        const params: any[] = [];

        if (search) {
            query += ' WHERE name LIKE ? OR industry LIKE ?';
            const s = `%${search}%`;
            params.push(s, s);
        }
        query += ' ORDER BY created_at DESC';

        const companies = db.prepare(query).all(...params);
        return NextResponse.json(companies);
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
      INSERT INTO companies (id, name, industry, size, website, address, phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.industry || null, data.size || null, data.website || null, data.address || null, data.phone || null, data.email || null);

        const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
        return NextResponse.json(company, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
