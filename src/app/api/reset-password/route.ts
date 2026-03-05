import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import bcryptjs from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();
        if (!token || !password) return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
        if (password.length < 6) return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 });

        const db = getDb();

        const resetToken = db.prepare(`
      SELECT prt.*, u.email, u.name
      FROM password_reset_tokens prt
      JOIN users u ON u.id = prt.user_id
      WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > datetime('now')
    `).get(token) as any;

        if (!resetToken) {
            return NextResponse.json({ error: 'Link đã hết hạn hoặc không hợp lệ' }, { status: 400 });
        }

        // Update password
        const hash = bcryptjs.hashSync(password, 10);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, resetToken.user_id);

        // Mark token as used
        db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(resetToken.id);

        return NextResponse.json({ message: 'Đặt lại mật khẩu thành công!' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
