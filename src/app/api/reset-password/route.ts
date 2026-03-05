import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import bcryptjs from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, code, password } = await request.json();
        if (!email || !code || !password) return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
        if (password.length < 6) return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 });

        const db = getDb();

        const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
        if (!user) return NextResponse.json({ error: 'Mã không đúng hoặc đã hết hạn' }, { status: 400 });

        const dbToken = `${user.id}:${code}`;

        const resetToken = db.prepare(`
      SELECT *
      FROM password_reset_tokens
      WHERE user_id = ? AND token = ? AND used = 0 AND expires_at > datetime('now')
      ORDER BY created_at DESC LIMIT 1
    `).get(user.id, dbToken) as any;

        if (!resetToken) {
            return NextResponse.json({ error: 'Mã không hợp lệ hoặc đã hết hạn' }, { status: 400 });
        }

        // Update password
        const hash = bcryptjs.hashSync(password, 10);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);

        // Mark token as used
        db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(resetToken.id);

        return NextResponse.json({ message: 'Đặt lại mật khẩu thành công!' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
