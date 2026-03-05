'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

const STAGE_LABELS: Record<string, string> = { lead: 'Lead', qualified: 'Đã xác nhận', proposal: 'Đề xuất', negotiation: 'Thương lượng', won: 'Thành công', lost: 'Thất bại' };

function formatCurrency(value: number) {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + ' tỷ';
    if (value >= 1000000) return (value / 1000000).toFixed(0) + ' tr';
    return value.toLocaleString('vi-VN') + ' đ';
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('info');
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        fetch(`/api/companies/${id}`).then(r => r.json()).then(setCompany).finally(() => setLoading(false));
    }, [id]);

    const addNote = async () => {
        if (!noteText.trim()) return;
        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: noteText, company_id: id, user_id: (session?.user as any)?.id }),
        });
        if (res.ok) {
            const note = await res.json();
            setCompany((prev: any) => ({ ...prev, notes: [note, ...(prev.notes || [])] }));
            setNoteText('');
            showToast('success', 'Đã thêm ghi chú');
        }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!company) return <div className="empty-state"><h3>Không tìm thấy công ty</h3></div>;

    const initials = company.name?.slice(0, 2).toUpperCase() || '??';
    const contacts = company.contacts || [];
    const deals = company.deals || [];
    const notes = company.notes || [];
    const totalDealValue = deals.reduce((s: number, d: any) => s + (d.value || 0), 0);

    return (
        <>
            <Link href="/dashboard/companies" className="back-link">← Quay lại danh sách</Link>

            <div className="detail-hero">
                <div className="detail-avatar-large" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>{initials}</div>
                <div className="detail-hero-info">
                    <h1>{company.name}</h1>
                    <div className="detail-subtitle">
                        {company.industry && <span>🏭 {company.industry}</span>}
                        {company.size && <span>👥 {company.size} nhân viên</span>}
                        {company.address && <span>📍 {company.address}</span>}
                    </div>
                </div>
            </div>

            <div className="mini-stats-row">
                <div className="mini-stat"><div className="mini-stat-value">{contacts.length}</div><div className="mini-stat-label">Liên hệ</div></div>
                <div className="mini-stat"><div className="mini-stat-value">{deals.length}</div><div className="mini-stat-label">Deals</div></div>
                <div className="mini-stat"><div className="mini-stat-value">{formatCurrency(totalDealValue)}</div><div className="mini-stat-label">Tổng giá trị</div></div>
                <div className="mini-stat"><div className="mini-stat-value">{notes.length}</div><div className="mini-stat-label">Ghi chú</div></div>
            </div>

            <div className="detail-tabs">
                <button className={`detail-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>Thông tin</button>
                <button className={`detail-tab ${tab === 'contacts' ? 'active' : ''}`} onClick={() => setTab('contacts')}>Liên hệ <span className="detail-tab-badge">{contacts.length}</span></button>
                <button className={`detail-tab ${tab === 'deals' ? 'active' : ''}`} onClick={() => setTab('deals')}>Deals <span className="detail-tab-badge">{deals.length}</span></button>
                <button className={`detail-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Ghi chú <span className="detail-tab-badge">{notes.length}</span></button>
            </div>

            {tab === 'info' && (
                <div className="detail-section">
                    <h3>📋 Thông tin công ty</h3>
                    <div className="info-grid">
                        <div className="info-item"><span className="info-label">Website</span><span className="info-value">{company.website ? <a href={company.website} target="_blank" rel="noopener">{company.website}</a> : '—'}</span></div>
                        <div className="info-item"><span className="info-label">Email</span><span className="info-value">{company.email || '—'}</span></div>
                        <div className="info-item"><span className="info-label">Điện thoại</span><span className="info-value">{company.phone || '—'}</span></div>
                        <div className="info-item"><span className="info-label">Ngành</span><span className="info-value">{company.industry || '—'}</span></div>
                        <div className="info-item"><span className="info-label">Quy mô</span><span className="info-value">{company.size || '—'}</span></div>
                        <div className="info-item"><span className="info-label">Địa chỉ</span><span className="info-value">{company.address || '—'}</span></div>
                    </div>
                </div>
            )}

            {tab === 'contacts' && (
                <div className="linked-items">
                    {contacts.length === 0 ? <div className="empty-state"><p>Chưa có liên hệ</p></div> : contacts.map((c: any) => (
                        <Link key={c.id} href={`/dashboard/contacts/${c.id}`} className="linked-item">
                            <div className="linked-item-icon" style={{ background: 'var(--accent-secondary-light)', color: 'var(--accent-secondary)' }}>👤</div>
                            <div className="linked-item-content">
                                <div className="linked-item-title">{c.first_name} {c.last_name}</div>
                                <div className="linked-item-sub">{c.position || ''} • {c.email || ''}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {tab === 'deals' && (
                <div className="linked-items">
                    {deals.length === 0 ? <div className="empty-state"><p>Chưa có deal</p></div> : deals.map((d: any) => (
                        <div key={d.id} className="linked-item">
                            <div className="linked-item-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>💰</div>
                            <div className="linked-item-content">
                                <div className="linked-item-title">{d.title}</div>
                                <div className="linked-item-sub">{formatCurrency(d.value)}</div>
                            </div>
                            <span className={`badge badge-${d.stage}`}>{STAGE_LABELS[d.stage] || d.stage}</span>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'notes' && (
                <>
                    <div className="note-add-form">
                        <textarea className="form-input" placeholder="Viết ghi chú..." value={noteText} onChange={e => setNoteText(e.target.value)} />
                        <button className="btn btn-primary" onClick={addNote} disabled={!noteText.trim()}>💾 Lưu</button>
                    </div>
                    {notes.length === 0 ? <div className="empty-state"><p>Chưa có ghi chú</p></div> : notes.map((n: any) => (
                        <div key={n.id} className="note-card">
                            <div className="note-card-header">
                                <span className="note-card-author">✍️ {n.user_name || 'Ẩn danh'}</span>
                                <span className="note-card-date">{new Date(n.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="note-card-content">{n.content}</div>
                        </div>
                    ))}
                </>
            )}
        </>
    );
}
