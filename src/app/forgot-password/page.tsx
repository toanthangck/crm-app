'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
                setSent(true);
                if (data.previewUrl) setPreviewUrl(data.previewUrl);
            } else {
                setError(data.error || 'Có lỗi xảy ra');
            }
        } catch {
            setError('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>💎 CRM Pro</h1>
                    <p>Quên mật khẩu</p>
                </div>

                {sent ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
                        <h3 style={{ marginBottom: 8 }}>Đã gửi email!</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                            Kiểm tra hộp thư <strong>{email}</strong> để lấy link đặt lại mật khẩu.
                        </p>
                        {previewUrl && (
                            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: '0.8rem' }}>
                                <strong>📨 Dev Mode:</strong>{' '}
                                <a href={previewUrl} target="_blank" rel="noopener" style={{ color: 'var(--accent-primary)' }}>
                                    Xem email tại Ethereal
                                </a>
                            </div>
                        )}
                        <Link href="/login" className="btn btn-primary btn-block">← Về trang đăng nhập</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                            Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
                        </p>

                        {error && (
                            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
                                ❌ {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email</label>
                            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@crm.com" required />
                        </div>

                        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                            {loading ? '⏳ Đang gửi...' : '📧 Gửi link đặt lại'}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>
                            <Link href="/login" style={{ color: 'var(--accent-primary)' }}>← Quay lại đăng nhập</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
