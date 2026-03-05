import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email) return NextResponse.json({ error: 'Vui lòng nhập email' }, { status: 400 });

        const db = getDb();
        const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email) as any;

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

        // Invalidate old tokens
        db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?').run(user.id);

        // Save new token
        db.prepare('INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(uuid(), user.id, token, expiresAt);

        // Send email
        const result = await sendPasswordResetEmail(user.email, user.name, token);

        return NextResponse.json({
            message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu',
            // Include preview URL in development
            ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
