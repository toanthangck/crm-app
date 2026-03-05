'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

export default function ContactsPage() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [contacts, setContacts] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingContact, setEditingContact] = useState<any>(null);
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', position: '', company_id: '', owner_id: '' });
    const [page, setPage] = useState(1);
    const perPage = 10;

    const fetchContacts = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        fetch(`/api/contacts?${params}`).then(r => r.json()).then(setContacts).finally(() => setLoading(false));
    };

    useEffect(() => { setPage(1); fetchContacts(); }, [search]);
    useEffect(() => {
        fetch('/api/companies').then(r => r.json()).then(setCompanies);
        fetch('/api/users').then(r => r.json()).then(setUsers);
    }, []);

    const totalPages = Math.ceil(contacts.length / perPage);
    const paginated = contacts.slice((page - 1) * perPage, page * perPage);

    const openAdd = () => {
        setEditingContact(null);
        setForm({ first_name: '', last_name: '', email: '', phone: '', position: '', company_id: '', owner_id: (session?.user as any)?.id || '' });
        setShowModal(true);
    };

    const openEdit = (c: any) => {
        setEditingContact(c);
        setForm({ first_name: c.first_name, last_name: c.last_name, email: c.email || '', phone: c.phone || '', position: c.position || '', company_id: c.company_id || '', owner_id: c.owner_id || '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        const method = editingContact ? 'PUT' : 'POST';
        const url = editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (res.ok) {
            showToast('success', editingContact ? 'Đã cập nhật liên hệ' : 'Đã thêm liên hệ mới');
            setShowModal(false);
            fetchContacts();
        } else {
            showToast('error', 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
        if (res.ok) { showToast('success', 'Đã xóa liên hệ'); fetchContacts(); }
    };

    const exportCSV = () => {
        const headers = ['Họ', 'Tên', 'Email', 'Điện thoại', 'Chức vụ', 'Công ty'];
        const rows = contacts.map(c => [c.first_name, c.last_name, c.email || '', c.phone || '', c.position || '', c.company_name || '']);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'contacts.csv'; a.click();
        showToast('success', `Đã xuất ${contacts.length} liên hệ ra CSV`);
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <>
            <div className="data-toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input placeholder="Tìm kiếm liên hệ..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={exportCSV}>📥 Xuất CSV</button>
                    <button className="btn btn-primary" onClick={openAdd}>➕ Thêm liên hệ</button>
                </div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Điện thoại</th>
                            <th>Chức vụ</th>
                            <th>Công ty</th>
                            <th>Phụ trách</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">👥</div><h3>Chưa có liên hệ</h3><p>Thêm liên hệ đầu tiên</p></div></td></tr>
                        ) : paginated.map(c => (
                            <tr key={c.id}>
                                <td><Link href={`/dashboard/contacts/${c.id}`} className="cell-name">{c.first_name} {c.last_name}</Link></td>
                                <td>{c.email || '—'}</td>
                                <td>{c.phone || '—'}</td>
                                <td>{c.position || '—'}</td>
                                <td>{c.company_name ? <Link href={`/dashboard/companies/${c.company_id}`} style={{ color: 'var(--text-secondary)' }}>{c.company_name}</Link> : '—'}</td>
                                <td>{c.owner_name || '—'}</td>
                                <td>
                                    <div className="actions-row">
                                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>✏️</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <div className="pagination-info">Hiển thị {(page - 1) * perPage + 1}–{Math.min(page * perPage, contacts.length)} / {contacts.length}</div>
                    <div className="pagination-controls">
                        <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i + 1} className={`pagination-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                        ))}
                        <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingContact ? '✏️ Sửa liên hệ' : '➕ Thêm liên hệ'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label>Họ *</label><input className="form-input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required /></div>
                                <div className="form-group"><label>Tên *</label><input className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                <div className="form-group"><label>Điện thoại</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label>Chức vụ</label><input className="form-input" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Công ty</label><select className="form-input" value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}><option value="">— Chọn —</option>{companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                <div className="form-group"><label>Phụ trách</label><select className="form-input" value={form.owner_id} onChange={e => setForm({ ...form, owner_id: e.target.value })}><option value="">— Chọn —</option>{users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
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
