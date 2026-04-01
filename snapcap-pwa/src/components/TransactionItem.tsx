import { CheckCircle2 } from 'lucide-react'
import type { Transaction } from '../types'

interface Props {
    tx: Transaction
    onDelete?: (id: string) => void
}

export default function TransactionItem({ tx, onDelete }: Props) {
    return (
        <div className="tx-item card" style={{ borderRadius: 14, marginBottom: 8, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                {/* Icon */}
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${tx.categoryColor}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                }}>
                    {tx.categoryIcon}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tx.merchant}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {tx.category} • {tx.date}
                    </p>
                </div>
                {/* Amount + status */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        -Rp {tx.amount.toLocaleString('id-ID')}
                    </span>
                    {tx.status === 'verified'
                        ? <CheckCircle2 size={16} color="var(--success)" />
                        : <span style={{ fontSize: '0.6875rem', color: 'var(--warning)', fontWeight: 600 }}>Pending</span>
                    }
                </div>
            </div>
            {onDelete && (
                <button
                    onClick={() => onDelete(tx.id)}
                    style={{
                        position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
                        background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6875rem', fontWeight: 700, gap: 4,
                        transform: 'translateX(100%)',
                        transition: 'transform 0.25s var(--ease)',
                    }}
                    aria-label={`Delete ${tx.merchant}`}
                >
                    🗑️ Delete
                </button>
            )}
        </div>
    )
}
