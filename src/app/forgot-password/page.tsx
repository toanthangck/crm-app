'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    const handleSendCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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
                setStep(2);
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

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, password }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
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
                    <p>Lấy lại mật khẩu</p>
                </div>

                {error && (
                    <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
                        ❌ {error}
                    </div>
                )}

                {previewUrl && !success && (
                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: '0.8rem' }}>
                        <strong>📨 Dev Mode:</strong>{' '}
                        <a href={previewUrl} target="_blank" rel="noopener" style={{ color: 'var(--accent-primary)' }}>Xem email tại Ethereal</a>
                    </div>
                )}

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                        <h3 style={{ marginBottom: 8 }}>Thành công!</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                            Mật khẩu đã được đổi thành công, bạn có thể đăng nhập ngay.
                        </p>
                        <Link href="/login" className="btn btn-primary btn-block btn-lg">🚀 Đăng nhập ngay</Link>
                    </div>
                ) : step === 1 ? (
                    <form onSubmit={handleSendCode}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                            Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác thực gồm 6 chữ số để lấy lại mật khẩu.
                        </p>

                        <div className="form-group">
                            <label>Email</label>
                            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@crm.com" required />
                        </div>

                        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                            {loading ? '⏳ Đang gửi...' : '📧 Gửi mã xác thực'}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>
                            <Link href="/login" style={{ color: 'var(--accent-primary)' }}>← Quay lại đăng nhập</Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16, textAlign: 'center' }}>
                            Mã xác thực đã được gửi tới <strong>{email}</strong>
                        </p>

                        <div className="form-group">
                            <label>Mã xác thực (6 số)</label>
                            <input
                                className="form-input"
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 700 }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu mới</label>
                            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Ít nhất 6 ký tự" required />
                        </div>

                        <div className="form-group">
                            <label>Xác nhận mật khẩu mới</label>
                            <input className="form-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>

                        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading || code.length !== 6}>
                            {loading ? '⏳ Đang xử lý...' : '🔐 Cập nhật mật khẩu'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <button type="button" className="btn btn-ghost" onClick={() => handleSendCode()} disabled={loading}>
                                📧 Gửi lại mã
                            </button>
                        </div>

                        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>
                            <Link href="/login" style={{ color: 'var(--accent-primary)' }}>← Quay lại đăng nhập</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
