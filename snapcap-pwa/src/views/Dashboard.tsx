import { useRef } from 'react'
import { Camera, Bell, TrendingUp, Calendar, ChevronRight, Upload } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import TransactionItem from '../components/TransactionItem'
import type { Transaction, AppView } from '../types'
import type { Translations } from '../i18n'

interface Props {
    transactions: Transaction[]
    onScan: () => void
    onUpload: (file: File) => void
    onNavigate: (v: AppView) => void
    t: Translations
}

export default function Dashboard({ transactions, onScan, onUpload, onNavigate, t }: Props) {
    const isEmpty = transactions.length === 0
    const today = new Date()
    const hour = today.getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const todayTotal = transactions.filter(t => t.date.startsWith('Today')).reduce((s, t) => s + t.amount, 0)
    const monthTotal = transactions.reduce((s, t) => s + t.amount, 0)

    return (
        <div className="app-shell">
            <div className="app-content">
                {isEmpty ? (
                    <EmptyState greeting={greeting} onScan={onScan} onUpload={onUpload} t={t} />
                ) : (
                    <PopulatedDashboard
                        greeting={greeting}
                        todayTotal={todayTotal}
                        monthTotal={monthTotal}
                        transactions={transactions}
                        onScan={onScan}
                        onUpload={onUpload}
                        onSeeAll={() => onNavigate('expenses')}
                        t={t}
                    />
                )}
            </div>
            <BottomNav active="dashboard" onNavigate={onNavigate} t={t} />
        </div>
    )
}

/* ---- Empty State ---- */
function EmptyState({ greeting, onScan, onUpload, t }: { greeting: string; onScan: () => void; onUpload: (file: File) => void; t: Translations }) {
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onUpload(file)
            e.target.value = '' // reset so same file can be re-selected
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%', padding: '0 20px' }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

            {/* Header */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 8px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{t.dashboard}</h1>
                <div style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #FDBCB4 0%, #FFD6CC 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👩</div>
                </div>
            </div>
            {/* Illustration */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: 220, height: 220, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #EBF0FF 0%, #F0EEFF 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{
                            width: 160, height: 160, borderRadius: 24,
                            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-md)', fontSize: 80,
                        }}>
                            🧾
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    <p style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>No expenses yet</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                        {greeting}! Scan your first receipt to start tracking your spending automatically.
                    </p>
                </div>
            </div>

            <div style={{ width: '100%', padding: '24px 0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary" onClick={onScan} style={{ gap: 10, fontSize: '1.0625rem' }}>
                    <Camera size={22} />
                    Scan Receipt
                </button>
                <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} style={{ gap: 10, fontSize: '1.0625rem' }}>
                    <Upload size={20} />
                    Upload Image
                </button>
            </div>
        </div>
    )
}

/* ---- Populated Dashboard ---- */
interface PopProps {
    greeting: string
    todayTotal: number
    monthTotal: number
    transactions: Transaction[]
    onScan: () => void
    onUpload: (file: File) => void
    onSeeAll: () => void
    t: Translations
}

function PopulatedDashboard({ greeting, todayTotal, monthTotal, transactions, onScan, onUpload, onSeeAll, t }: PopProps) {
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onUpload(file)
            e.target.value = ''
        }
    }

    return (
        <div style={{ padding: '0 0 16px' }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 4px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', border: '2.5px solid var(--primary-light)', flexShrink: 0 }}>
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FDBCB4, #FFD6CC)', fontSize: 24 }}>👦</div>
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Welcome back,</p>
                    <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Alex Morgan</p>
                </div>
                <button style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--bg-card)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: 'var(--shadow-xs)' }}>
                    <Bell size={20} color="var(--text-secondary)" />
                    <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', border: '2px solid white' }} />
                </button>
            </div>

            <h2 style={{ padding: '8px 20px 20px', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {greeting}!
            </h2>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 24px' }}>
                {/* Today */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #0041D0 100%)',
                    borderRadius: 20, padding: '20px 18px',
                    boxShadow: 'var(--shadow-primary)',
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 500, marginBottom: 6 }}>{t.todaysTotal}</p>
                    <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>Rp {todayTotal.toLocaleString('id-ID')}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '4px 10px' }}>
                        <TrendingUp size={13} color="rgba(255,255,255,0.9)" />
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.6875rem', fontWeight: 700 }}>+12%</span>
                    </div>
                </div>
                {/* Monthly */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '20px 18px', boxShadow: 'var(--shadow-xs)', border: '1.5px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500, marginBottom: 6 }}>{t.monthlyTotal}</p>
                    <p style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>Rp {monthTotal.toLocaleString('id-ID')}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 500 }}>Sep 1 – Sep 30</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 24px' }}>
                <button
                    onClick={onScan}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '14px 16px', borderRadius: 16,
                        background: 'linear-gradient(135deg, var(--primary) 0%, #0041D0 100%)',
                        color: '#fff', border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'inherit',
                        boxShadow: 'var(--shadow-primary)',
                        transition: 'transform 0.15s var(--ease)',
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <Camera size={18} />
                    Scan
                </button>
                <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '14px 16px', borderRadius: 16,
                        background: 'var(--bg-card)', color: 'var(--text-primary)',
                        border: '1.5px solid var(--border)', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'inherit',
                        boxShadow: 'var(--shadow-xs)',
                        transition: 'transform 0.15s var(--ease)',
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <Upload size={18} />
                    Upload
                </button>
            </div>

            {/* Recent Transactions */}
            <div style={{ padding: '0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>{t.recentTransactions}</h3>
                    <button onClick={onSeeAll} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                        {t.seeAll} <ChevronRight size={16} />
                    </button>
                </div>
                {transactions.slice(0, 5).map(tx => (
                    <TransactionItem key={tx.id} tx={tx} />
                ))}
            </div>

            {/* FAB */}
            <div style={{ position: 'fixed', bottom: 'calc(var(--nav-height) + 16px)', right: 20, zIndex: 90 }}>
                <button
                    onClick={onScan}
                    style={{
                        width: 56, height: 56, borderRadius: 28,
                        background: 'var(--primary)', color: '#fff',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-primary)',
                        transition: 'transform 0.15s var(--ease), box-shadow 0.15s var(--ease)',
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    aria-label={t.scanReceipt}
                >
                    <Camera size={24} />
                </button>
            </div>
        </div>
    )
}
