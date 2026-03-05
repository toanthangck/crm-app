import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import getDb from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = getDb();
        const data = await request.json();

        if (data.action === 'profile') {
            db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(data.name, data.email, id);
            return NextResponse.json({ message: 'Cập nhật thành công' });
        }

        if (data.action === 'password') {
            const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
            if (!user) return NextResponse.json({ error: 'Không tìm thấy user' }, { status: 404 });

            const isValid = bcryptjs.compareSync(data.currentPassword, user.password_hash);
            if (!isValid) return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 });

            const newHash = bcryptjs.hashSync(data.newPassword, 10);
            db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, id);
            return NextResponse.json({ message: 'Đổi mật khẩu thành công' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
