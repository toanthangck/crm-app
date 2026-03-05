import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        const deal = db.prepare(`
      SELECT d.*, c.first_name || ' ' || c.last_name as contact_name, co.name as company_name, u.name as owner_name
      FROM deals d
      LEFT JOIN contacts c ON d.contact_id = c.id
      LEFT JOIN companies co ON d.company_id = co.id
      LEFT JOIN users u ON d.owner_id = u.id
      WHERE d.id = ?
    `).get(id);
        if (!deal) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

        const notes = db.prepare('SELECT n.*, u.name as user_name FROM notes n LEFT JOIN users u ON n.user_id = u.id WHERE n.deal_id = ? ORDER BY n.created_at DESC').all(id);
        const activities = db.prepare('SELECT * FROM activities WHERE deal_id = ? ORDER BY created_at DESC').all(id);

        return NextResponse.json({ ...(deal as object), notes, activities });
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
      UPDATE deals SET title = ?, value = ?, stage = ?, contact_id = ?, company_id = ?, owner_id = ?, expected_close = ?, description = ?
      WHERE id = ?
    `).run(data.title, data.value || 0, data.stage, data.contact_id || null, data.company_id || null, data.owner_id || null, data.expected_close || null, data.description || null, id);

        const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(id);
        return NextResponse.json(deal);
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        const data = await request.json();

        if (data.stage) {
            db.prepare('UPDATE deals SET stage = ? WHERE id = ?').run(data.stage, id);
        }

        const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(id);
        return NextResponse.json(deal);
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        db.prepare('DELETE FROM deals WHERE id = ?').run(id);
        return NextResponse.json({ message: 'Đã xóa' });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
