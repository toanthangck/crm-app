import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email) return NextResponse.json({ error: 'Vui lòng nhập email' }, { status: 400 });

        const db = getDb();
        const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email) as any;

        if (!user) {
            return NextResponse.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được mã đặt lại mật khẩu' });
        }

        // Generate 6-digit code
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

        // Invalidate old tokens
        db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?').run(user.id);

        // Save new code. Store user.id:token to avoid unique constraint collisions just in case
        const dbToken = `${user.id}:${token}`;
        db.prepare('INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(uuid(), user.id, dbToken, expiresAt);

        // Send email
        const result = await sendPasswordResetEmail(user.email, user.name, token);

        return NextResponse.json({
            message: 'Nếu email tồn tại, bạn sẽ nhận được mã đặt lại mật khẩu',
            ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
