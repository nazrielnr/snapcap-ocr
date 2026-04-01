import { CheckCircle2, ScanLine } from 'lucide-react'
import type { Translations } from '../i18n'

interface Props {
    merchant: string
    amount: number
    onDismiss: () => void
    onScanAnother: () => void
    t: Translations
}

export default function SuccessModal({ merchant, amount, onDismiss, onScanAnother, t }: Props) {
    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 24px', zIndex: 300,
        }}>
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 28, padding: '36px 28px',
                width: '100%', maxWidth: 380,
                textAlign: 'center',
                animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
                boxShadow: 'var(--shadow-lg)',
            }}>
                {/* Success icon */}
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{
                        width: 88, height: 88, borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--success-light) 0%, transparent 70%)',
                    }} />
                    <div style={{
                        position: 'absolute', width: 60, height: 60, borderRadius: 30,
                        background: 'var(--success)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                        animation: 'successPop 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
                    }}>
                        <CheckCircle2 size={28} color="#fff" />
                    </div>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.02em' }}>
                    {t.expenseSaved}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 32 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{merchant} (Rp {amount.toFixed(2)})</strong>
                    {' '}{t.addedToTracker}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button className="btn btn-primary" onClick={onDismiss}>
                        {t.dismiss}
                    </button>
                    <button className="btn btn-secondary" onClick={onScanAnother} style={{ gap: 8 }}>
                        <ScanLine size={18} /> {t.scanAnother}
                    </button>
                </div>
            </div>
        </div>
    )
}
