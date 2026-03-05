'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

const STAGE_COLORS: Record<string, string> = {
    lead: '#94a3b8', qualified: '#3b82f6', proposal: '#8b5cf6',
    negotiation: '#f59e0b', won: '#10b981', lost: '#ef4444',
};
const STAGE_LABELS: Record<string, string> = {
    lead: 'Lead', qualified: 'Đã xác nhận', proposal: 'Đề xuất',
    negotiation: 'Thương lượng', won: 'Thành công', lost: 'Thất bại',
};

function formatCurrency(value: number) {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + ' tỷ';
    if (value >= 1000000) return (value / 1000000).toFixed(0) + ' tr';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
    return value.toLocaleString('vi-VN');
}

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<number | null>(null);

    useEffect(() => {
        const duration = 1200;
        const start = performance.now();
        const from = 0;

        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(from + (value - from) * eased));
            if (progress < 1) {
                ref.current = requestAnimationFrame(animate);
            }
        };

        ref.current = requestAnimationFrame(animate);
        return () => { if (ref.current) cancelAnimationFrame(ref.current); };
    }, [value]);

    return <>{prefix}{formatCurrency(display)}{suffix}</>;
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Chào buổi sáng', emoji: '🌅' };
    if (h < 18) return { text: 'Chào buổi chiều', emoji: '☀️' };
    return { text: 'Chào buổi tối', emoji: '🌙' };
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!data) return null;

    const greeting = getGreeting();
    const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const pieData = (data.dealsByStage || []).map((s: any) => ({
        name: STAGE_LABELS[s.stage] || s.stage,
        value: s.count,
        color: STAGE_COLORS[s.stage] || '#94a3b8',
    }));

    const barData = (data.monthlyRevenue || []).map((m: any) => ({
        month: m.month,
        'Đã thắng': m.won / 1000000,
        'Pipeline': m.pipeline / 1000000,
    }));

    const winRate = data.totalDeals > 0
        ? Math.round(((data.dealsByStage?.find((s: any) => s.stage === 'won')?.count || 0) / data.totalDeals) * 100)
        : 0;

    return (
        <>
            <div className="welcome-banner">
                <h2>{greeting.emoji} {greeting.text}, {session?.user?.name?.split(' ').pop() || 'bạn'}!</h2>
                <p>Đây là tổng quan hoạt động kinh doanh của bạn hôm nay.</p>
                <div className="welcome-date">📅 {today}</div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card revenue">
                    <div className="kpi-header">
                        <span className="kpi-label">Doanh thu</span>
                        <div className="kpi-icon revenue">💰</div>
                    </div>
                    <div className="kpi-value"><AnimatedNumber value={data.totalRevenue} /></div>
                    <div className="kpi-sub">Từ deals đã thành công</div>
                </div>

                <div className="kpi-card deals">
                    <div className="kpi-header">
                        <span className="kpi-label">Pipeline</span>
                        <div className="kpi-icon deals">📈</div>
                    </div>
                    <div className="kpi-value"><AnimatedNumber value={data.pipelineValue} /></div>
                    <div className="kpi-sub">{data.totalDeals} deals • Win rate {winRate}%</div>
                </div>

                <div className="kpi-card contacts">
                    <div className="kpi-header">
                        <span className="kpi-label">Liên hệ</span>
                        <div className="kpi-icon contacts">👥</div>
                    </div>
                    <div className="kpi-value">{data.totalContacts}</div>
                    <div className="kpi-sub">{data.totalCompanies} công ty</div>
                </div>

                <div className="kpi-card tasks">
                    <div className="kpi-header">
                        <span className="kpi-label">Việc cần làm</span>
                        <div className="kpi-icon tasks">✅</div>
                    </div>
                    <div className="kpi-value">{data.pendingTasks}</div>
                    <div className="kpi-sub">Đang chờ xử lý</div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>📊 Doanh thu theo tháng (triệu VNĐ)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={barData}>
                            <defs>
                                <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 13 }} />
                            <Area type="monotone" dataKey="Đã thắng" stroke="#10b981" strokeWidth={2} fill="url(#colorWon)" />
                            <Area type="monotone" dataKey="Pipeline" stroke="#3b82f6" strokeWidth={2} fill="url(#colorPipeline)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>🎯 Deals theo giai đoạn</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                {pieData.map((entry: any, index: number) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 13 }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3>🕐 Hoạt động gần đây</h3>
                {data.recentActivities?.length > 0 ? (
                    <div className="activity-list">
                        {data.recentActivities.map((a: any) => (
                            <div key={a.id} className="activity-item">
                                <div className={`activity-icon ${a.type === 'note' ? 'note-type' : a.type}`}>
                                    {a.type === 'call' ? '📞' : a.type === 'email' ? '📧' : a.type === 'meeting' ? '🤝' : '📝'}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-title">{a.title}</div>
                                    <div className="activity-desc">{a.contact_name && `👤 ${a.contact_name}`} {a.description && `— ${a.description}`}</div>
                                </div>
                                <div className="activity-meta">
                                    <span className={`badge badge-${a.status}`}>
                                        {a.status === 'todo' ? 'Chờ' : a.status === 'in_progress' ? 'Đang làm' : 'Xong'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>Chưa có hoạt động nào</p>
                    </div>
                )}
            </div>
        </>
    );
}
