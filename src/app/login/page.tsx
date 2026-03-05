'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Email hoặc mật khẩu không đúng');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>CRM Pro</h1>
                    <p>Đăng nhập để quản lý khách hàng</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="admin@crm.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? '⏳ Đang đăng nhập...' : '🔐 Đăng nhập'}
                    </button>

                    <div style={{ textAlign: 'right', marginTop: 12 }}>
                        <Link href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>Quên mật khẩu?</Link>
                    </div>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
                </p>

                <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>Demo accounts:</strong><br />
                    Admin: admin@crm.com / abcd1234<br />
                    User: nguyen@crm.com / user123
                </div>
            </div>
        </div>
    );
}
