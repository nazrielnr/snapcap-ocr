import { useState } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import TransactionItem from '../components/TransactionItem'
import type { Transaction, AppView } from '../types'
import type { Translations } from '../i18n'

interface Props {
    transactions: Transaction[]
    onNavigate: (v: AppView) => void
    onDeleteTransaction: (id: string) => void
    t: Translations
}

export default function ExpensesView({ transactions, onNavigate, onDeleteTransaction, t }: Props) {
    const [deleting, setDeleting] = useState<string | null>(null)

    const today = transactions.filter(t => t.date.startsWith('Today'))
    const yest = transactions.filter(t => t.date.startsWith('Yesterday'))
    const older = transactions.filter(t => !t.date.startsWith('Today') && !t.date.startsWith('Yesterday'))

    const Section = ({ label, items }: { label: string; items: Transaction[] }) => items.length > 0 ? (
        <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '12px 0 8px' }}>{label}</p>
            {items.map(tx => (
                <div key={tx.id} style={{ position: 'relative' }}>
                    <div
                        onClick={() => setDeleting(deleting === tx.id ? null : tx.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <TransactionItem tx={tx} />
                    </div>
                    {deleting === tx.id && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <button
                                onClick={() => { onDeleteTransaction(tx.id); setDeleting(null) }}
                                style={{ flex: 1, background: 'var(--danger-light)', color: 'var(--danger)', border: '1.5px solid var(--danger)', borderRadius: 12, padding: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                                <Trash2 size={15} /> {t.delete}
                            </button>
                            <button
                                onClick={() => setDeleting(null)}
                                style={{ flex: 1, background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    ) : null

    return (
        <div className="app-shell">
            <div className="page-header">
                <button className="header-btn" onClick={() => onNavigate('dashboard')}><ArrowLeft size={20} /></button>
                <span className="header-title">{t.expenses}</span>
                <div style={{ width: 40 }} />
            </div>
            <div className="app-content" style={{ padding: '0 20px' }}>
                <Section label="Today" items={today} />
                <Section label="Yesterday" items={yest} />
                <Section label="Earlier" items={older} />
                {transactions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '2rem', marginBottom: 12 }}>📋</p>
                        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t.noExpenses}</p>
                    </div>
                )}
            </div>
            <BottomNav active="expenses" onNavigate={onNavigate} t={t} />
        </div>
    )
}
