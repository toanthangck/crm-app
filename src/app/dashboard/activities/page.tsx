'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const TYPE_ICONS: Record<string, string> = { call: '📞', email: '📧', meeting: '🤝', note: '📝' };
const TYPE_LABELS: Record<string, string> = { call: 'Cuộc gọi', email: 'Email', meeting: 'Cuộc họp', note: 'Ghi chú' };
const STATUS_LABELS: Record<string, string> = { todo: 'Chờ xử lý', in_progress: 'Đang làm', done: 'Hoàn thành' };

export default function ActivitiesPage() {
    const { data: session } = useSession();
    const [activities, setActivities] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [deals, setDeals] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ type: 'call', title: '', description: '', contact_id: '', deal_id: '', user_id: '', due_date: '', status: 'todo' });

    const fetchActivities = () => {
        const params = new URLSearchParams();
        if (filterStatus) params.set('status', filterStatus);
        if (filterType) params.set('type', filterType);
        fetch(`/api/activities?${params}`).then(r => r.json()).then(setActivities).finally(() => setLoading(false));
    };

    useEffect(() => { fetchActivities(); }, [filterStatus, filterType]);
    useEffect(() => {
        fetch('/api/contacts').then(r => r.json()).then(setContacts);
        fetch('/api/deals').then(r => r.json()).then(setDeals);
        fetch('/api/users').then(r => r.json()).then(setUsers);
    }, []);

    const openAdd = () => {
        setEditing(null);
        setForm({ type: 'call', title: '', description: '', contact_id: '', deal_id: '', user_id: (session?.user as any)?.id || '', due_date: '', status: 'todo' });
        setShowModal(true);
    };

    const openEdit = (a: any) => {
        setEditing(a);
        setForm({ type: a.type, title: a.title, description: a.description || '', contact_id: a.contact_id || '', deal_id: a.deal_id || '', user_id: a.user_id || '', due_date: a.due_date || '', status: a.status });
        setShowModal(true);
    };

    const handleSave = async () => {
        const method = editing ? 'PUT' : 'POST';
        const url = editing ? `/api/activities/${editing.id}` : '/api/activities';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setShowModal(false);
        fetchActivities();
    };

    const toggleStatus = async (a: any) => {
        const next = a.status === 'todo' ? 'in_progress' : a.status === 'in_progress' ? 'done' : 'todo';
        await fetch(`/api/activities/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
        fetchActivities();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        await fetch(`/api/activities/${id}`, { method: 'DELETE' });
        fetchActivities();
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <>
            <div className="data-toolbar">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <select className="form-input" style={{ width: 'auto', padding: '8px 32px 8px 12px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="todo">Chờ xử lý</option>
                        <option value="in_progress">Đang làm</option>
                        <option value="done">Hoàn thành</option>
                    </select>
                    <select className="form-input" style={{ width: 'auto', padding: '8px 32px 8px 12px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">Tất cả loại</option>
                        <option value="call">📞 Cuộc gọi</option>
                        <option value="email">📧 Email</option>
                        <option value="meeting">🤝 Cuộc họp</option>
                        <option value="note">📝 Ghi chú</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>➕ Thêm hoạt động</button>
            </div>

            {activities.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>Chưa có hoạt động</h3>
                    <p>Tạo hoạt động đầu tiên</p>
                    <button className="btn btn-primary" onClick={openAdd}>➕ Thêm hoạt động</button>
                </div>
            ) : (
                <div className="activity-list">
                    {activities.map(a => (
                        <div key={a.id} className="activity-item">
                            <div className={`activity-icon ${a.type === 'note' ? 'note-type' : a.type}`} onClick={() => toggleStatus(a)} style={{ cursor: 'pointer' }} title="Click để đổi trạng thái">
                                {a.status === 'done' ? '✅' : TYPE_ICONS[a.type]}
                            </div>
                            <div className="activity-content" onClick={() => openEdit(a)} style={{ cursor: 'pointer' }}>
                                <div className="activity-title" style={a.status === 'done' ? { textDecoration: 'line-through', opacity: 0.6 } : {}}>{a.title}</div>
                                <div className="activity-desc">
                                    {a.contact_name && `👤 ${a.contact_name}`}
                                    {a.deal_title && ` • 💰 ${a.deal_title}`}
                                    {a.description && ` — ${a.description}`}
                                </div>
                            </div>
                            <div className="activity-meta" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {a.due_date && <span className="activity-date">📅 {a.due_date}</span>}
                                <span className={`badge badge-${a.status}`}>{STATUS_LABELS[a.status]}</span>
                                <span className={`badge badge-${a.type}`}>{TYPE_LABELS[a.type]}</span>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(a.id)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editing ? '✏️ Sửa hoạt động' : '➕ Thêm hoạt động'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Loại *</label>
                                    <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        <option value="call">📞 Cuộc gọi</option>
                                        <option value="email">📧 Email</option>
                                        <option value="meeting">🤝 Cuộc họp</option>
                                        <option value="note">📝 Ghi chú</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="todo">Chờ xử lý</option>
                                        <option value="in_progress">Đang làm</option>
                                        <option value="done">Hoàn thành</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Tiêu đề *</label>
                                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Liên hệ</label>
                                    <select className="form-input" value={form.contact_id} onChange={e => setForm({ ...form, contact_id: e.target.value })}>
                                        <option value="">— Chọn —</option>
                                        {contacts.map((c: any) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Deal</label>
                                    <select className="form-input" value={form.deal_id} onChange={e => setForm({ ...form, deal_id: e.target.value })}>
                                        <option value="">— Chọn —</option>
                                        {deals.map((d: any) => <option key={d.id} value={d.id}>{d.title}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phụ trách</label>
                                    <select className="form-input" value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })}>
                                        <option value="">— Chọn —</option>
                                        {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ngày hẹn</label>
                                    <input className="form-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                                </div>
                            </div>
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
