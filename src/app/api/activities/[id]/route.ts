import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        const data = await request.json();

        db.prepare(`
      UPDATE activities SET type = ?, title = ?, description = ?, contact_id = ?, deal_id = ?, company_id = ?, user_id = ?, due_date = ?, status = ?
      WHERE id = ?
    `).run(data.type, data.title, data.description || null, data.contact_id || null, data.deal_id || null, data.company_id || null, data.user_id || null, data.due_date || null, data.status, id);

        const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
        return NextResponse.json(activity);
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        const data = await request.json();

        if (data.status) {
            db.prepare('UPDATE activities SET status = ? WHERE id = ?').run(data.status, id);
        }

        const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
        return NextResponse.json(activity);
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        db.prepare('DELETE FROM activities WHERE id = ?').run(id);
        return NextResponse.json({ message: 'Đã xóa' });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
