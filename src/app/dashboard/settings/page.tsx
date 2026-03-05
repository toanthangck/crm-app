'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ToastProvider';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || '');
            setEmail(session.user.email || '');
        }
    }, [session]);

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const res = await fetch(`/api/users/${(session?.user as any)?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, action: 'profile' }),
            });
            if (res.ok) {
                showToast('success', 'Đã cập nhật hồ sơ');
                await update();
            } else {
                const data = await res.json();
                showToast('error', data.error || 'Có lỗi xảy ra');
            }
        } catch {
            showToast('error', 'Có lỗi xảy ra');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            showToast('error', 'Mật khẩu xác nhận không khớp');
            return;
        }
        if (newPassword.length < 6) {
            showToast('error', 'Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        setSavingPassword(true);
        try {
            const res = await fetch(`/api/users/${(session?.user as any)?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword, action: 'password' }),
            });
            if (res.ok) {
                showToast('success', 'Đã đổi mật khẩu');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await res.json();
                showToast('error', data.error || 'Có lỗi xảy ra');
            }
        } catch {
            showToast('error', 'Có lỗi xảy ra');
        } finally {
            setSavingPassword(false);
        }
    };

    const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

    return (
        <div className="settings-container">
            <div className="settings-section">
                <h3>👤 Hồ sơ cá nhân</h3>
                <p>Cập nhật thông tin tài khoản của bạn</p>

                <div className="settings-avatar-row">
                    <div className="settings-avatar">{initials}</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{(session?.user as any)?.role || 'user'}</div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Họ và tên</label>
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
            </div>

            <div className="settings-section">
                <h3>🔐 Đổi mật khẩu</h3>
                <p>Đảm bảo tài khoản của bạn an toàn</p>

                <div className="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <input className="form-input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <input className="form-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Ít nhất 6 ký tự" />
                    </div>
                    <div className="form-group">
                        <label>Xác nhận mật khẩu</label>
                        <input className="form-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                </div>

                <button className="btn btn-primary" onClick={handleChangePassword} disabled={savingPassword || !currentPassword || !newPassword}>
                    {savingPassword ? '⏳ Đang đổi...' : '🔐 Đổi mật khẩu'}
                </button>
            </div>
        </div>
    );
}
