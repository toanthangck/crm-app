'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ContactsPage() {
    const { data: session } = useSession();
    const [contacts, setContacts] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingContact, setEditingContact] = useState<any>(null);
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', position: '', company_id: '', owner_id: '' });

    const fetchContacts = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        fetch(`/api/contacts?${params}`).then(r => r.json()).then(setContacts).finally(() => setLoading(false));
    };

    useEffect(() => { fetchContacts(); }, [search]);
    useEffect(() => {
        fetch('/api/companies').then(r => r.json()).then(setCompanies);
        fetch('/api/users').then(r => r.json()).then(setUsers);
    }, []);

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
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setShowModal(false);
        fetchContacts();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
        fetchContacts();
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <>
            <div className="data-toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input placeholder="Tìm kiếm liên hệ..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={openAdd}>➕ Thêm liên hệ</button>
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
                        {contacts.length === 0 ? (
                            <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">👥</div><h3>Chưa có liên hệ</h3><p>Thêm liên hệ đầu tiên</p></div></td></tr>
                        ) : contacts.map(c => (
                            <tr key={c.id}>
                                <td><span className="cell-name" onClick={() => openEdit(c)}>{c.first_name} {c.last_name}</span></td>
                                <td>{c.email || '—'}</td>
                                <td>{c.phone || '—'}</td>
                                <td>{c.position || '—'}</td>
                                <td>{c.company_name || '—'}</td>
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

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingContact ? '✏️ Sửa liên hệ' : '➕ Thêm liên hệ'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Họ *</label>
                                    <input className="form-input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Tên *</label>
                                    <input className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Điện thoại</label>
                                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Chức vụ</label>
                                <input className="form-input" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Công ty</label>
                                    <select className="form-input" value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}>
                                        <option value="">— Chọn —</option>
                                        {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Phụ trách</label>
                                    <select className="form-input" value={form.owner_id} onChange={e => setForm({ ...form, owner_id: e.target.value })}>
                                        <option value="">— Chọn —</option>
                                        {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
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
