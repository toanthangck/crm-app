import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        db.prepare('DELETE FROM notes WHERE id = ?').run(id);
        return NextResponse.json({ message: 'Đã xóa' });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
