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

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [contact, setContact] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('info');
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        fetch(`/api/contacts/${id}`).then(r => r.json()).then(setContact).finally(() => setLoading(false));
    }, [id]);

    const addNote = async () => {
        if (!noteText.trim()) return;
        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: noteText, contact_id: id, user_id: (session?.user as any)?.id }),
        });
        if (res.ok) {
            const note = await res.json();
            setContact((prev: any) => ({ ...prev, notes: [note, ...(prev.notes || [])] }));
            setNoteText('');
            showToast('success', 'Đã thêm ghi chú');
        }
    };

    const deleteNote = async (noteId: string) => {
        await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
        setContact((prev: any) => ({ ...prev, notes: prev.notes.filter((n: any) => n.id !== noteId) }));
        showToast('success', 'Đã xóa ghi chú');
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!contact) return <div className="empty-state"><h3>Không tìm thấy liên hệ</h3></div>;

    const initials = `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`.toUpperCase();
    const deals = contact.deals || [];
    const activities = contact.activities || [];
    const notes = contact.notes || [];

    return (
        <>
            <Link href="/dashboard/contacts" className="back-link">← Quay lại danh sách</Link>

            <div className="detail-hero">
                <div className="detail-avatar-large">{initials}</div>
                <div className="detail-hero-info">
                    <h1>{contact.first_name} {contact.last_name}</h1>
                    <div className="detail-subtitle">
                        {contact.position && <span>💼 {contact.position}</span>}
                        {contact.company_name && <Link href={`/dashboard/companies/${contact.company_id}`}>🏢 {contact.company_name}</Link>}
                        {contact.owner_name && <span>👤 {contact.owner_name}</span>}
                    </div>
                </div>
            </div>

            <div className="mini-stats-row">
                <div className="mini-stat"><div className="mini-stat-value">{deals.length}</div><div className="mini-stat-label">Deals</div></div>
                <div className="mini-stat"><div className="mini-stat-value">{formatCurrency(deals.reduce((s: number, d: any) => s + (d.value || 0), 0))}</div><div className="mini-stat-label">Tổng giá trị</div></div>
                <div className="mini-stat"><div className="mini-stat-value">{activities.length}</div><div className="mini-stat-label">Hoạt động</div></div>
                <div className="mini-stat"><div className="mini-stat-value">{notes.length}</div><div className="mini-stat-label">Ghi chú</div></div>
            </div>

            <div className="detail-tabs">
                <button className={`detail-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>Thông tin</button>
                <button className={`detail-tab ${tab === 'deals' ? 'active' : ''}`} onClick={() => setTab('deals')}>Deals <span className="detail-tab-badge">{deals.length}</span></button>
                <button className={`detail-tab ${tab === 'activities' ? 'active' : ''}`} onClick={() => setTab('activities')}>Hoạt động <span className="detail-tab-badge">{activities.length}</span></button>
                <button className={`detail-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Ghi chú <span className="detail-tab-badge">{notes.length}</span></button>
            </div>

            {tab === 'info' && (
                <div className="detail-section">
                    <h3>📋 Thông tin liên hệ</h3>
                    <div className="info-grid">
                        <div className="info-item"><span className="info-label">Email</span><span className="info-value">{contact.email || '—'}</span></div>
                        <div className="info-item"><span className="info-label">Điện thoại</span><span className="info-value">{contact.phone || '—'}</span></div>
                        <div className="info-item"><span className="info-label">Chức vụ</span><span className="info-value">{contact.position || '—'}</span></div>
                        <div className="info-item"><span className="info-label">Công ty</span><span className="info-value">{contact.company_name || '—'}</span></div>
                        <div className="info-item"><span className="info-label">Phụ trách</span><span className="info-value">{contact.owner_name || '—'}</span></div>
                        <div className="info-item"><span className="info-label">Ngày tạo</span><span className="info-value">{new Date(contact.created_at).toLocaleDateString('vi-VN')}</span></div>
                    </div>
                </div>
            )}

            {tab === 'deals' && (
                <div className="linked-items">
                    {deals.length === 0 ? <div className="empty-state"><p>Chưa có deal nào</p></div> : deals.map((d: any) => (
                        <div key={d.id} className="linked-item">
                            <div className="linked-item-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>💰</div>
                            <div className="linked-item-content">
                                <div className="linked-item-title">{d.title}</div>
                                <div className="linked-item-sub">{formatCurrency(d.value)} • {d.expected_close || 'Chưa xác định'}</div>
                            </div>
                            <span className={`badge badge-${d.stage}`}>{STAGE_LABELS[d.stage] || d.stage}</span>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'activities' && (
                <div className="activity-list">
                    {activities.length === 0 ? <div className="empty-state"><p>Chưa có hoạt động</p></div> : activities.map((a: any) => (
                        <div key={a.id} className="activity-item">
                            <div className={`activity-icon ${a.type === 'note' ? 'note-type' : a.type}`}>
                                {a.type === 'call' ? '📞' : a.type === 'email' ? '📧' : a.type === 'meeting' ? '🤝' : '📝'}
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">{a.title}</div>
                                <div className="activity-desc">{a.description || ''}</div>
                            </div>
                            <div className="activity-meta">
                                {a.due_date && <span className="activity-date">📅 {a.due_date}</span>}
                                <span className={`badge badge-${a.status}`}>{a.status === 'todo' ? 'Chờ' : a.status === 'in_progress' ? 'Đang làm' : 'Xong'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'notes' && (
                <>
                    <div className="note-add-form">
                        <textarea className="form-input" placeholder="Viết ghi chú mới..." value={noteText} onChange={e => setNoteText(e.target.value)} />
                        <button className="btn btn-primary" onClick={addNote} disabled={!noteText.trim()}>💾 Lưu</button>
                    </div>
                    {notes.length === 0 ? <div className="empty-state"><p>Chưa có ghi chú</p></div> : notes.map((n: any) => (
                        <div key={n.id} className="note-card">
                            <div className="note-card-header">
                                <span className="note-card-author">✍️ {n.user_name || 'Ẩn danh'}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="note-card-date">{new Date(n.created_at).toLocaleDateString('vi-VN')}</span>
                                    <button className="btn btn-ghost btn-sm" onClick={() => deleteNote(n.id)}>🗑️</button>
                                </div>
                            </div>
                            <div className="note-card-content">{n.content}</div>
                        </div>
                    ))}
                </>
            )}
        </>
    );
}
