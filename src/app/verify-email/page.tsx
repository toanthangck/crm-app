'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const router = useRouter();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, action: 'verify' }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setError(data.error || 'Mã xác thực không đúng');
            }
        } catch {
            setError('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        try {
            const res = await fetch('/api/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, action: 'send' }),
            });
            const data = await res.json();
            if (data.previewUrl) setPreviewUrl(data.previewUrl);
        } catch { /* ignore */ }
        finally { setResending(false); }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>💎 CRM Pro</h1>
                    <p>Xác thực email</p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                        <h3>Xác thực thành công!</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 20px' }}>Đang chuyển hướng đến trang đăng nhập...</p>
                    </div>
                ) : (
                    <form onSubmit={handleVerify}>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✉️</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Chúng tôi đã gửi mã xác thực 6 số đến <strong>{email}</strong>
                            </p>
                        </div>

                        {error && (
                            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
                                ❌ {error}
                            </div>
                        )}

                        {previewUrl && (
                            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: '0.8rem' }}>
                                <strong>📨 Dev Mode:</strong>{' '}
                                <a href={previewUrl} target="_blank" rel="noopener" style={{ color: 'var(--accent-primary)' }}>Xem email tại Ethereal</a>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Mã xác thực</label>
                            <input
                                className="form-input"
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 700 }}
                                required
                            />
                        </div>

                        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading || code.length !== 6}>
                            {loading ? '⏳ Đang xác thực...' : '✅ Xác thực'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <button type="button" className="btn btn-ghost" onClick={handleResend} disabled={resending}>
                                {resending ? '⏳ Đang gửi...' : '📧 Gửi lại mã'}
                            </button>
                        </div>

                        <p style={{ textAlign: 'center', marginTop: 12, fontSize: '0.85rem' }}>
                            <Link href="/login" style={{ color: 'var(--text-secondary)' }}>← Quay lại đăng nhập</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="loading-spinner"><div className="spinner"></div></div>}>
            <VerifyEmailForm />
        </Suspense>
    );
}
