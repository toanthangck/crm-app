import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        const contact = db.prepare(`
      SELECT c.*, co.name as company_name, u.name as owner_name
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE c.id = ?
    `).get(id);

        if (!contact) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

        const notes = db.prepare('SELECT n.*, u.name as user_name FROM notes n LEFT JOIN users u ON n.user_id = u.id WHERE n.contact_id = ? ORDER BY n.created_at DESC').all(id);
        const deals = db.prepare('SELECT * FROM deals WHERE contact_id = ? ORDER BY created_at DESC').all(id);
        const activities = db.prepare('SELECT * FROM activities WHERE contact_id = ? ORDER BY created_at DESC').all(id);

        return NextResponse.json({ ...(contact as object), notes, deals, activities });
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
      UPDATE contacts SET first_name = ?, last_name = ?, email = ?, phone = ?, position = ?, company_id = ?, owner_id = ?, tags = ?, notes = ?
      WHERE id = ?
    `).run(data.first_name, data.last_name, data.email || null, data.phone || null, data.position || null, data.company_id || null, data.owner_id || null, JSON.stringify(data.tags || []), data.notes || null, id);

        const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
        return NextResponse.json(contact);
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
        return NextResponse.json({ message: 'Đã xóa' });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
