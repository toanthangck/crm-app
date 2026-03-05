'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const STAGE_COLORS: Record<string, string> = {
    lead: '#94a3b8',
    qualified: '#3b82f6',
    proposal: '#8b5cf6',
    negotiation: '#f59e0b',
    won: '#10b981',
    lost: '#ef4444',
};

const STAGE_LABELS: Record<string, string> = {
    lead: 'Lead',
    qualified: 'Đã xác nhận',
    proposal: 'Đề xuất',
    negotiation: 'Thương lượng',
    won: 'Thành công',
    lost: 'Thất bại',
};

function formatCurrency(value: number) {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + ' tỷ';
    if (value >= 1000000) return (value / 1000000).toFixed(0) + ' tr';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
    return value.toLocaleString('vi-VN');
}

export default function DashboardPage() {
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

    return (
        <>
            <div className="kpi-grid">
                <div className="kpi-card revenue">
                    <div className="kpi-header">
                        <span className="kpi-label">Doanh thu</span>
                        <div className="kpi-icon revenue">💰</div>
                    </div>
                    <div className="kpi-value">{formatCurrency(data.totalRevenue)}</div>
                    <div className="kpi-sub">Từ deals đã thành công</div>
                </div>

                <div className="kpi-card deals">
                    <div className="kpi-header">
                        <span className="kpi-label">Pipeline</span>
                        <div className="kpi-icon deals">📈</div>
                    </div>
                    <div className="kpi-value">{formatCurrency(data.pipelineValue)}</div>
                    <div className="kpi-sub">{data.totalDeals} deals tổng cộng</div>
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
                        <span className="kpi-label">Tasks</span>
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
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 8,
                                    fontSize: 13
                                }}
                            />
                            <Bar dataKey="Đã thắng" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Pipeline" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>🎯 Deals theo giai đoạn</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {pieData.map((entry: any, index: number) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
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
