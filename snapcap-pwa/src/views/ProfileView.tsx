import { LogOut, Bell, Lock, HelpCircle, ChevronRight } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import type { AppView, Transaction } from '../types'
import type { Translations, Language } from '../i18n'

interface Props {
    transactions: Transaction[]
    onNavigate: (v: AppView) => void
    language: Language
    setLanguage: (lang: Language) => void
    t: Translations
}

const MENU = [
    { icon: Bell, label: 'Notifications', sub: 'Manage alerts' },
    { icon: Lock, label: 'Privacy & Security', sub: 'Data & encryption' },
    { icon: HelpCircle, label: 'Help & Support', sub: 'FAQ and contact' },
    { icon: LogOut, label: 'Sign Out', sub: '', danger: true },
]

export default function ProfileView({ transactions, onNavigate, language, setLanguage, t }: Props) {
    const totalReceipts = transactions.length
    const thisMonthTotal = transactions.reduce((sum, tx) => sum + tx.amount, 0)

    return (
        <div className="app-shell">
            <div className="page-header">
                <div style={{ width: 40 }} />
                <span className="header-title">{t.profile}</span>
                <div style={{ width: 40 }} />
            </div>

            <div className="app-content" style={{ padding: '0 20px 24px' }}>
                {/* Avatar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 28px' }}>
                    <div style={{
                        width: 84, height: 84, borderRadius: 42,
                        background: 'linear-gradient(135deg, #FDBCB4, #FFD6CC)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 42, marginBottom: 14,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        border: '3px solid white',
                    }}>👦</div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 4 }}>Alex Morgan</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>alex.morgan@email.com</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
                    {[[t.receipts, totalReceipts.toString()], [t.thisMonth, `Rp ${thisMonthTotal.toLocaleString('id-ID')}`], [t.saved, '0h']].map(([label, value]) => (
                        <div key={label} className="card-bordered" style={{ padding: '14px 10px', textAlign: 'center', borderRadius: 14 }}>
                            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{value}</p>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Language Selector */}
                <div style={{ marginBottom: 16 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{t.selectLanguage}</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            onClick={() => setLanguage('id')}
                            style={{
                                flex: 1, padding: '12px 16px', borderRadius: 12, border: '2px solid',
                                borderColor: language === 'id' ? 'var(--primary)' : 'var(--border)',
                                background: language === 'id' ? 'var(--primary-light)' : 'var(--bg-card)',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem',
                                color: language === 'id' ? 'var(--primary)' : 'var(--text-secondary)',
                            }}
                        >
                            🇮🇩 Indonesia
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            style={{
                                flex: 1, padding: '12px 16px', borderRadius: 12, border: '2px solid',
                                borderColor: language === 'en' ? 'var(--primary)' : 'var(--border)',
                                background: language === 'en' ? 'var(--primary-light)' : 'var(--bg-card)',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem',
                                color: language === 'en' ? 'var(--primary)' : 'var(--text-secondary)',
                            }}
                        >
                            🇬🇧 English
                        </button>
                    </div>
                </div>

                {/* Menu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {MENU.map(({ icon: Icon, label, sub, danger }) => (
                        <button key={label} style={{
                            width: '100%', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '14px 16px',
                            display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'background 0.15s var(--ease)',
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                background: danger ? 'var(--danger-light)' : 'var(--bg-canvas)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon size={18} color={danger ? 'var(--danger)' : 'var(--text-secondary)'} />
                            </div>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: danger ? 'var(--danger)' : 'var(--text-primary)' }}>{label}</p>
                                {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>{sub}</p>}
                            </div>
                            {!danger && <ChevronRight size={18} color="var(--text-muted)" />}
                        </button>
                    ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 24 }}>
                    SnapCap v1.0 · Made with ❤️
                </p>
            </div>

            <BottomNav active="profile" onNavigate={onNavigate} t={t} />
        </div>
    )
}
