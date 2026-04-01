import { ArrowLeft, TrendingUp } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import type { Transaction, AppView } from '../types'
import type { Translations } from '../i18n'

interface Props {
    transactions: Transaction[]
    onNavigate: (v: AppView) => void
    t: Translations
}

const CATEGORY_COLORS: Record<string, string> = {
    'Food & Dining': '#F59E0B',
    Groceries: '#10B981',
    Transportation: '#3B82F6',
    Entertainment: '#8B5CF6',
    Shopping: '#EC4899',
    Health: '#14B8A6',
    Utilities: '#F97316',
    Other: '#6B7280',
}

export default function ReportsView({ transactions, onNavigate, t }: Props) {
    const total = transactions.reduce((s, t) => s + t.amount, 0)

    // Group by category
    const catMap: Record<string, number> = {}
    transactions.forEach(t => {
        catMap[t.category] = (catMap[t.category] ?? 0) + t.amount
    })
    const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1])

    return (
        <div className="app-shell">
            <div className="page-header">
                <button className="header-btn" onClick={() => onNavigate('dashboard')}><ArrowLeft size={20} /></button>
                <span className="header-title">{t.reports}</span>
                <div style={{ width: 40 }} />
            </div>

            <div className="app-content" style={{ padding: '0 20px 24px' }}>
                {/* Summary card */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #0041D0 100%)',
                    borderRadius: 20, padding: '24px 22px', marginBottom: 24,
                    boxShadow: 'var(--shadow-primary)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                        <TrendingUp size={16} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{t.monthlySpending}</span>
                    </div>
                    <p style={{ color: '#fff', fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
                        Rp {total.toLocaleString('id-ID')}
                    </p>
                    {/* Limit progress */}
                    <div className="progress-bar-track" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <div style={{ width: `min(${(total / 20000000) * 100}%, 100%)`, height: '100%', background: 'rgba(255,255,255,0.9)', borderRadius: 999 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Rp 20.000.000 Limit</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{((total / 20000000) * 100).toFixed(0)}% Used</span>
                    </div>
                </div>

                {/* Category breakdown */}
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 14 }}>{t.byCategory}</h3>

                {cats.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '0.9375rem' }}>No data yet – start scanning receipts!</p>
                    </div>
                )}
                {cats.map(([cat, amt]) => {
                    const pct = total > 0 ? (amt / total) * 100 : 0
                    const color = CATEGORY_COLORS[cat] ?? '#6B7280'
                    return (
                        <div key={cat} className="card" style={{ padding: '14px 16px', marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{cat}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Rp {amt.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="progress-bar-track">
                                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
                            </div>
                            <p style={{ marginTop: 5, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{pct.toFixed(0)}% of total</p>
                        </div>
                    )
                })}
            </div>

            <BottomNav active="reports" onNavigate={onNavigate} t={t} />
        </div>
    )
}
