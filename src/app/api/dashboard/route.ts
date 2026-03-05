import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
    try {
        const db = getDb();
        seedDatabase();

        const totalContacts = (db.prepare('SELECT COUNT(*) as count FROM contacts').get() as any).count;
        const totalDeals = (db.prepare('SELECT COUNT(*) as count FROM deals').get() as any).count;
        const totalCompanies = (db.prepare('SELECT COUNT(*) as count FROM companies').get() as any).count;

        const wonDeals = db.prepare("SELECT COALESCE(SUM(value), 0) as total FROM deals WHERE stage = 'won'").get() as any;
        const totalRevenue = wonDeals.total;

        const pipelineDeals = db.prepare("SELECT COALESCE(SUM(value), 0) as total FROM deals WHERE stage NOT IN ('won', 'lost')").get() as any;
        const pipelineValue = pipelineDeals.total;

        const dealsByStage = db.prepare(`
      SELECT stage, COUNT(*) as count, COALESCE(SUM(value), 0) as value 
      FROM deals GROUP BY stage
    `).all();

        const recentActivities = db.prepare(`
      SELECT a.*, u.name as user_name, c.first_name || ' ' || c.last_name as contact_name 
      FROM activities a 
      LEFT JOIN users u ON a.user_id = u.id 
      LEFT JOIN contacts c ON a.contact_id = c.id 
      ORDER BY a.created_at DESC LIMIT 10
    `).all();

        const pendingTasks = (db.prepare("SELECT COUNT(*) as count FROM activities WHERE status != 'done'").get() as any).count;

        const monthlyRevenue = db.prepare(`
      SELECT 
        CASE cast(strftime('%m', expected_close) as integer)
          WHEN 1 THEN 'T1' WHEN 2 THEN 'T2' WHEN 3 THEN 'T3'
          WHEN 4 THEN 'T4' WHEN 5 THEN 'T5' WHEN 6 THEN 'T6'
          WHEN 7 THEN 'T7' WHEN 8 THEN 'T8' WHEN 9 THEN 'T9'
          WHEN 10 THEN 'T10' WHEN 11 THEN 'T11' WHEN 12 THEN 'T12'
        END as month,
        COALESCE(SUM(CASE WHEN stage = 'won' THEN value ELSE 0 END), 0) as won,
        COALESCE(SUM(CASE WHEN stage NOT IN ('won', 'lost') THEN value ELSE 0 END), 0) as pipeline
      FROM deals 
      WHERE expected_close IS NOT NULL
      GROUP BY strftime('%m', expected_close)
      ORDER BY strftime('%m', expected_close)
    `).all();

        return NextResponse.json({
            totalContacts,
            totalDeals,
            totalCompanies,
            totalRevenue,
            pipelineValue,
            dealsByStage,
            recentActivities,
            pendingTasks,
            monthlyRevenue,
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
