import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email, action, code } = await request.json();
        const db = getDb();

        if (action === 'send') {
            // Send verification code
            const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email) as any;
            if (!user) return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });

            // Generate 6-digit code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

            // Invalidate old codes
            db.prepare('UPDATE email_verification_codes SET used = 1 WHERE user_id = ?').run(user.id);

            // Save new code
            db.prepare('INSERT INTO email_verification_codes (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)').run(uuid(), user.id, verificationCode, expiresAt);

            // Send email
            const result = await sendVerificationEmail(user.email, user.name, verificationCode);

            return NextResponse.json({
                message: 'Đã gửi mã xác thực đến email của bạn',
                ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
            });
        }

        if (action === 'verify') {
            // Verify code
            const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
            if (!user) return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });

            const validCode = db.prepare(`
        SELECT * FROM email_verification_codes
        WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
        ORDER BY created_at DESC LIMIT 1
      `).get(user.id, code) as any;

            if (!validCode) {
                return NextResponse.json({ error: 'Mã xác thực không đúng hoặc đã hết hạn' }, { status: 400 });
            }

            // Mark code as used, mark user email as verified
            db.prepare('UPDATE email_verification_codes SET used = 1 WHERE id = ?').run(validCode.id);
            db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(user.id);

            return NextResponse.json({ message: 'Xác thực email thành công!' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Verify email error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
