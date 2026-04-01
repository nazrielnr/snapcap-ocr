import { useState } from 'react'
import { ArrowLeft, AlertTriangle, Store, Calendar, DollarSign, Tag, ScanLine } from 'lucide-react'

const CATEGORIES = ['Food & Dining', 'Groceries', 'Transportation', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Other']

interface Props {
    onSave: (merchant: string, amount: number, date: string, category: string) => void
    onScanAgain: () => void
    onBack: () => void
}

export default function ManualEntry({ onSave, onScanAgain, onBack }: Props) {
    const [merchant, setMerchant] = useState('')
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState('')
    const [category, setCategory] = useState(CATEGORIES[0])

    const isValid = merchant.trim() && parseFloat(amount) > 0 && date.trim()

    const handleSave = () => {
        if (!isValid) return
        onSave(merchant.trim(), parseFloat(amount), date.trim(), category)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--bg-canvas)' }}>
            {/* Header */}
            <div className="page-header">
                <button className="header-btn" onClick={onBack}><ArrowLeft size={20} /></button>
                <span className="header-title">Manual Entry</span>
                <button className="btn btn-ghost" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9375rem', width: 'auto', minHeight: 'auto', padding: '0 8px' }} onClick={onScanAgain}>Skip</button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 24px' }}>
                {/* Error banner */}
                <div style={{
                    background: '#FFF7ED', border: '1.5px solid #FED7AA',
                    borderRadius: 16, padding: '16px 18px', marginBottom: 24,
                    display: 'flex', gap: 12,
                }}>
                    <div style={{ width: 36, height: 36, borderRadius: 18, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <AlertTriangle size={18} color="var(--warning)" />
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, color: '#92400E', marginBottom: 4 }}>Extraction Failed</p>
                        <p style={{ color: '#B45309', fontSize: '0.875rem', lineHeight: 1.5 }}>
                            We couldn't read that receipt clearly. Please enter details below or try scanning again.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div className="form-group">
                        <label className="form-label">Merchant Name</label>
                        <div className="input-wrapper">
                            <div className="input-icon"><Store size={18} color="var(--text-muted)" /></div>
                            <input className="input-field" type="text" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="e.g. Starbucks" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Total Amount</label>
                        <div className="input-wrapper">
                            <div className="input-icon"><DollarSign size={18} color="var(--text-muted)" /></div>
                            <input className="input-field" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <div className="input-wrapper">
                            <div className="input-icon"><Calendar size={18} color="var(--text-muted)" /></div>
                            <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <div className="input-wrapper">
                            <div className="input-icon"><Tag size={18} color="var(--text-muted)" /></div>
                            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)} style={{ appearance: 'none', cursor: 'pointer' }}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!isValid} style={{ opacity: isValid ? 1 : 0.5 }}>
                        Save Transaction
                    </button>
                    <button className="btn btn-secondary" onClick={onScanAgain} style={{ gap: 8 }}>
                        <ScanLine size={18} /> Try Scan Again
                    </button>
                </div>
            </div>
        </div>
    )
}
