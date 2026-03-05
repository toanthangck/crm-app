'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ToastProvider';

const STAGES = [
    { key: 'lead', label: 'Lead' },
    { key: 'qualified', label: 'Đã xác nhận' },
    { key: 'proposal', label: 'Đề xuất' },
    { key: 'negotiation', label: 'Thương lượng' },
    { key: 'won', label: 'Thành công' },
    { key: 'lost', label: 'Thất bại' },
];

function formatCurrency(value: number) {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + ' tỷ';
    if (value >= 1000000) return (value / 1000000).toFixed(0) + ' tr';
    return value.toLocaleString('vi-VN') + ' đ';
}

export default function DealsPage() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [deals, setDeals] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [dragId, setDragId] = useState<string | null>(null);
    const [form, setForm] = useState({ title: '', value: '', stage: 'lead', contact_id: '', company_id: '', owner_id: '', expected_close: '', description: '' });

    const fetchDeals = () => {
        fetch('/api/deals').then(r => r.json()).then(setDeals).finally(() => setLoading(false));
    };

    useEffect(() => { fetchDeals(); }, []);
    useEffect(() => {
        fetch('/api/contacts').then(r => r.json()).then(setContacts);
        fetch('/api/companies').then(r => r.json()).then(setCompanies);
        fetch('/api/users').then(r => r.json()).then(setUsers);
    }, []);

    const openAdd = (stage = 'lead') => {
        setEditing(null);
        setForm({ title: '', value: '', stage, contact_id: '', company_id: '', owner_id: (session?.user as any)?.id || '', expected_close: '', description: '' });
        setShowModal(true);
    };

    const openEdit = (d: any) => {
        setEditing(d);
        setForm({ title: d.title, value: String(d.value || 0), stage: d.stage, contact_id: d.contact_id || '', company_id: d.company_id || '', owner_id: d.owner_id || '', expected_close: d.expected_close || '', description: d.description || '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        const method = editing ? 'PUT' : 'POST';
        const url = editing ? `/api/deals/${editing.id}` : '/api/deals';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, value: parseFloat(form.value) || 0 }) });
        if (res.ok) { showToast('success', editing ? 'Đã cập nhật deal' : 'Đã thêm deal mới'); setShowModal(false); fetchDeals(); }
        else showToast('error', 'Có lỗi xảy ra');
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDragId(id);
        e.dataTransfer.effectAllowed = 'move';
        (e.target as HTMLElement).classList.add('dragging');
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).classList.remove('dragging');
        setDragId(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        (e.currentTarget as HTMLElement).classList.add('drag-over');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).classList.remove('drag-over');
    };

    const handleDrop = async (e: React.DragEvent, stage: string) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.remove('drag-over');
        if (!dragId) return;

        const deal = deals.find(d => d.id === dragId);
        if (deal && deal.stage !== stage) {
            setDeals(prev => prev.map(d => d.id === dragId ? { ...d, stage } : d));
            await fetch(`/api/deals/${dragId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage }) });
            const stageLabel = STAGES.find(s => s.key === stage)?.label || stage;
            showToast('info', `Di chuyển "${deal.title}" → ${stageLabel}`);
        }
        setDragId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa deal này?')) return;
        const res = await fetch(`/api/deals/${id}`, { method: 'DELETE' });
        if (res.ok) { showToast('success', 'Đã xóa deal'); fetchDeals(); }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <>
            <div className="data-toolbar">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    🖱️ Kéo thả deal giữa các cột để cập nhật giai đoạn
                </div>
                <button className="btn btn-primary" onClick={() => openAdd()}>➕ Thêm deal</button>
            </div>

            <div className="kanban-board">
                {STAGES.map(stage => {
                    const stageDeals = deals.filter(d => d.stage === stage.key);
                    const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
                    return (
                        <div key={stage.key} className={`kanban-column ${stage.key}`}>
                            <div className="kanban-column-header">
                                <span>{stage.label}</span>
                                <span className="column-count">{stageDeals.length} • {formatCurrency(stageValue)}</span>
                            </div>
                            <div className="kanban-cards" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, stage.key)}>
                                {stageDeals.map(deal => (
                                    <div key={deal.id} className="kanban-card" draggable onDragStart={e => handleDragStart(e, deal.id)} onDragEnd={handleDragEnd}>
                                        <div className="kanban-card-title" onClick={() => openEdit(deal)} style={{ cursor: 'pointer' }}>{deal.title}</div>
                                        {deal.company_name && <div className="kanban-card-company">🏢 {deal.company_name}</div>}
                                        <div className="kanban-card-value">{formatCurrency(deal.value)}</div>
                                        <div className="kanban-card-footer">
                                            <span>{deal.contact_name && `👤 ${deal.contact_name}`}</span>
                                            <span>{deal.expected_close && `📅 ${deal.expected_close}`}</span>
                                        </div>
                                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(deal.id); }}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                                {stageDeals.length === 0 && (
                                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Kéo deal vào đây</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editing ? '✏️ Sửa deal' : '➕ Thêm deal'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group"><label>Tên deal *</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Giá trị (VNĐ)</label><input className="form-input" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></div>
                                <div className="form-group"><label>Giai đoạn</label><select className="form-input" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>{STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Liên hệ</label><select className="form-input" value={form.contact_id} onChange={e => setForm({ ...form, contact_id: e.target.value })}><option value="">— Chọn —</option>{contacts.map((c: any) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
                                <div className="form-group"><label>Công ty</label><select className="form-input" value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}><option value="">— Chọn —</option>{companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Phụ trách</label><select className="form-input" value={form.owner_id} onChange={e => setForm({ ...form, owner_id: e.target.value })}><option value="">— Chọn —</option>{users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                                <div className="form-group"><label>Ngày close dự kiến</label><input className="form-input" type="date" value={form.expected_close} onChange={e => setForm({ ...form, expected_close: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label>Mô tả</label><textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave}>💾 Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
