import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

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

        db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(id, name, email, passwordHash, 'sales_rep');

        return NextResponse.json({ message: 'Đăng ký thành công' }, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
