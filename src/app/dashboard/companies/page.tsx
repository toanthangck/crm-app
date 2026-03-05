'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

export default function CompaniesPage() {
    const { showToast } = useToast();
    const [companies, setCompanies] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: '', industry: '', size: '', website: '', address: '', phone: '', email: '' });
    const [page, setPage] = useState(1);
    const perPage = 10;

    const fetchCompanies = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        fetch(`/api/companies?${params}`).then(r => r.json()).then(setCompanies).finally(() => setLoading(false));
    };

    useEffect(() => { setPage(1); fetchCompanies(); }, [search]);

    const totalPages = Math.ceil(companies.length / perPage);
    const paginated = companies.slice((page - 1) * perPage, page * perPage);

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
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (res.ok) { showToast('success', editing ? 'Đã cập nhật công ty' : 'Đã thêm công ty mới'); setShowModal(false); fetchCompanies(); }
        else showToast('error', 'Có lỗi xảy ra');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
        if (res.ok) { showToast('success', 'Đã xóa công ty'); fetchCompanies(); }
    };

    const exportCSV = () => {
        const headers = ['Tên', 'Ngành', 'Quy mô', 'Website', 'Điện thoại', 'Địa chỉ'];
        const rows = companies.map(c => [c.name, c.industry || '', c.size || '', c.website || '', c.phone || '', c.address || '']);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'companies.csv'; a.click();
        showToast('success', `Đã xuất ${companies.length} công ty ra CSV`);
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <>
            <div className="data-toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input placeholder="Tìm kiếm công ty..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={exportCSV}>📥 Xuất CSV</button>
                    <button className="btn btn-primary" onClick={openAdd}>➕ Thêm công ty</button>
                </div>
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
                        {paginated.length === 0 ? (
                            <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🏢</div><h3>Chưa có công ty</h3><p>Thêm công ty đầu tiên</p></div></td></tr>
                        ) : paginated.map(c => (
                            <tr key={c.id}>
                                <td><Link href={`/dashboard/companies/${c.id}`} className="cell-name">{c.name}</Link></td>
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

            {totalPages > 1 && (
                <div className="pagination">
                    <div className="pagination-info">Hiển thị {(page - 1) * perPage + 1}–{Math.min(page * perPage, companies.length)} / {companies.length}</div>
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
                            <h2>{editing ? '✏️ Sửa công ty' : '➕ Thêm công ty'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group"><label>Tên công ty *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Ngành nghề</label><input className="form-input" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} /></div>
                                <div className="form-group"><label>Quy mô</label>
                                    <select className="form-input" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}>
                                        <option value="">— Chọn —</option><option value="1-10">1-10</option><option value="11-50">11-50</option><option value="50-200">50-200</option><option value="200-1000">200-1000</option><option value="1000-5000">1000-5000</option><option value="5000-10000">5000-10000</option><option value="10000+">10000+</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Website</label><input className="form-input" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></div>
                                <div className="form-group"><label>Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Điện thoại</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                <div className="form-group"><label>Địa chỉ</label><input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
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
