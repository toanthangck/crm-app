'use client';

import { SessionProvider } from 'next-auth/react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ToastProvider } from '@/components/ToastProvider';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('crm-theme') || 'light';
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
    }, []);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        localStorage.setItem('crm-theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    if (status === 'loading') {
        return <div className="loading-spinner"><div className="spinner"></div></div>;
    }

    if (status === 'unauthenticated') {
        window.location.href = '/login';
        return null;
    }

    const user = session?.user;
    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

    const navItems = [
        { href: '/dashboard', label: 'Tổng quan', icon: '📊', section: 'main' },
        { href: '/dashboard/contacts', label: 'Liên hệ', icon: '👥', section: 'main' },
        { href: '/dashboard/companies', label: 'Công ty', icon: '🏢', section: 'main' },
        { href: '/dashboard/deals', label: 'Deals', icon: '💰', section: 'sales' },
        { href: '/dashboard/activities', label: 'Hoạt động', icon: '✅', section: 'sales' },
        { href: '/dashboard/settings', label: 'Cài đặt', icon: '⚙️', section: 'system' },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const pageTitle = navItems.find(item => isActive(item.href))?.label || 'CRM Pro';

    return (
        <div className="app-layout">
            {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <h1>💎 CRM Pro</h1>
                    <span>Quản lý khách hàng</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Tổng quan</div>
                        {navItems.filter(i => i.section === 'main').map(item => (
                            <Link key={item.href} href={item.href} className={`nav-link ${isActive(item.href) ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Bán hàng</div>
                        {navItems.filter(i => i.section === 'sales').map(item => (
                            <Link key={item.href} href={item.href} className={`nav-link ${isActive(item.href) ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Hệ thống</div>
                        {navItems.filter(i => i.section === 'system').map(item => (
                            <Link key={item.href} href={item.href} className={`nav-link ${isActive(item.href) ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        CRM Pro v2.0 © 2026
                    </div>
                </div>
            </aside>

            <div className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                        <h2>{pageTitle}</h2>
                    </div>

                    <div className="header-right">
                        <button className="theme-toggle" onClick={toggleTheme} title="Đổi theme">
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>

                        <div className="dropdown">
                            <div className="user-menu" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                                <div className="user-avatar">{initials}</div>
                                <div className="user-info">
                                    <div className="user-name">{user?.name}</div>
                                    <div className="user-role">{(user as any)?.role || 'user'}</div>
                                </div>
                            </div>

                            {userMenuOpen && (
                                <div className="dropdown-menu">
                                    <Link href="/dashboard/settings" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        ⚙️ Cài đặt
                                    </Link>
                                    <button className="dropdown-item danger" onClick={() => signOut({ callbackUrl: '/login' })}>
                                        🚪 Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="page-content" onClick={() => setUserMenuOpen(false)}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ToastProvider>
                <DashboardContent>{children}</DashboardContent>
            </ToastProvider>
        </SessionProvider>
    );
}
