import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
    try {
        const db = getDb();
        seedDatabase();
        const users = db.prepare('SELECT id, name, email, role FROM users ORDER BY name').all();
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
