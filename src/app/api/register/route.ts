import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 });
        }

        const db = getDb();
        seedDatabase();

        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 400 });
        }

        const passwordHash = bcryptjs.hashSync(password, 10);
        const id = uuidv4();

        // Create user with email_verified = 0
        db.prepare('INSERT INTO users (id, name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, email, passwordHash, 'sales_rep', 0);

        // Generate and send verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        db.prepare('INSERT INTO email_verification_codes (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)').run(uuidv4(), id, code, expiresAt);

        const result = await sendVerificationEmail(email, name, code);

        return NextResponse.json({
            message: 'Đăng ký thành công. Vui lòng xác thực email.',
            ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
        }, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
