'use client';

import { useState, useEffect } from 'react';

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: '', industry: '', size: '', website: '', address: '', phone: '', email: '' });

    const fetchCompanies = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        fetch(`/api/companies?${params}`).then(r => r.json()).then(setCompanies).finally(() => setLoading(false));
    };

    useEffect(() => { fetchCompanies(); }, [search]);

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', industry: '', size: '', website: '', address: '', phone: '', email: '' });
        setShowModal(true);
    };

    const openEdit = (c: any) => {
        setEditing(c);
        setForm({ name: c.name, industry: c.industry || '', size: c.size || '', website: c.website || '', address: c.address || '', phone: c.phone || '', email: c.email || '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        const method = editing ? 'PUT' : 'POST';
        const url = editing ? `/api/companies/${editing.id}` : '/api/companies';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setShowModal(false);
        fetchCompanies();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        await fetch(`/api/companies/${id}`, { method: 'DELETE' });
        fetchCompanies();
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <>
            <div className="data-toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input placeholder="Tìm kiếm công ty..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={openAdd}>➕ Thêm công ty</button>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Tên công ty</th>
                            <th>Ngành</th>
                            <th>Quy mô</th>
                            <th>Website</th>
                            <th>Điện thoại</th>
                            <th>Địa chỉ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.length === 0 ? (
                            <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🏢</div><h3>Chưa có công ty</h3><p>Thêm công ty đầu tiên</p></div></td></tr>
                        ) : companies.map(c => (
                            <tr key={c.id}>
                                <td><span className="cell-name" onClick={() => openEdit(c)}>{c.name}</span></td>
                                <td>{c.industry || '—'}</td>
                                <td>{c.size || '—'}</td>
                                <td>{c.website ? <a href={c.website} target="_blank" rel="noopener">{c.website.replace(/^https?:\/\//, '')}</a> : '—'}</td>
                                <td>{c.phone || '—'}</td>
                                <td>{c.address || '—'}</td>
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
                            <h2>{editing ? '✏️ Sửa công ty' : '➕ Thêm công ty'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên công ty *</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngành nghề</label>
                                    <input className="form-input" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Quy mô</label>
                                    <select className="form-input" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}>
                                        <option value="">— Chọn —</option>
                                        <option value="1-10">1-10</option>
                                        <option value="11-50">11-50</option>
                                        <option value="50-200">50-200</option>
                                        <option value="200-1000">200-1000</option>
                                        <option value="1000-5000">1000-5000</option>
                                        <option value="5000-10000">5000-10000</option>
                                        <option value="10000+">10000+</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Website</label>
                                    <input className="form-input" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Điện thoại</label>
                                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Địa chỉ</label>
                                    <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
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
