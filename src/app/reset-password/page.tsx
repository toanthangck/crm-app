'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }
        if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (res.ok) { setSuccess(true); }
            else { setError(data.error || 'Có lỗi xảy ra'); }
        } catch {
            setError('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
                        <h3>Link không hợp lệ</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 20px' }}>Link đặt lại mật khẩu không đúng hoặc đã hết hạn.</p>
                        <Link href="/forgot-password" className="btn btn-primary btn-block">Yêu cầu link mới</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>💎 CRM Pro</h1>
                    <p>Đặt lại mật khẩu</p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                        <h3>Thành công!</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 20px' }}>Mật khẩu đã được đặt lại. Bạn có thể đăng nhập ngay.</p>
                        <Link href="/login" className="btn btn-primary btn-block btn-lg">🚀 Đăng nhập ngay</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
                                ❌ {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Mật khẩu mới</label>
                            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Ít nhất 6 ký tự" required />
                        </div>

                        <div className="form-group">
                            <label>Xác nhận mật khẩu</label>
                            <input className="form-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>

                        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                            {loading ? '⏳ Đang xử lý...' : '🔐 Đặt lại mật khẩu'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="loading-spinner"><div className="spinner"></div></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
