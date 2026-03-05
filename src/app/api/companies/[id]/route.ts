import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
        if (!company) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

        const contacts = db.prepare('SELECT * FROM contacts WHERE company_id = ? ORDER BY created_at DESC').all(id);
        const deals = db.prepare('SELECT * FROM deals WHERE company_id = ? ORDER BY created_at DESC').all(id);
        const notes = db.prepare('SELECT n.*, u.name as user_name FROM notes n LEFT JOIN users u ON n.user_id = u.id WHERE n.company_id = ? ORDER BY n.created_at DESC').all(id);

        return NextResponse.json({ ...(company as object), contacts, deals, notes });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        const data = await request.json();

        db.prepare(`
      UPDATE companies SET name = ?, industry = ?, size = ?, website = ?, address = ?, phone = ?, email = ?
      WHERE id = ?
    `).run(data.name, data.industry || null, data.size || null, data.website || null, data.address || null, data.phone || null, data.email || null, id);

        const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
        return NextResponse.json(company);
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        db.prepare('DELETE FROM companies WHERE id = ?').run(id);
        return NextResponse.json({ message: 'Đã xóa' });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
