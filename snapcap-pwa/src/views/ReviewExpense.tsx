import { useState } from 'react'
import { ArrowLeft, MoreVertical, CheckCircle2, AlertTriangle, Store, Calendar, Tag, FileText, RotateCcw } from 'lucide-react'
import type { ScannedData, AppView } from '../types'
import BottomNav from '../components/BottomNav'

const CATEGORIES = ['Food & Dining', 'Groceries', 'Transportation', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Other']

interface Props {
    data: ScannedData
    onSave: (merchant: string, amount: number, date: string, category: string) => void
    onRetake: () => void
    onNavigate: (v: AppView) => void
}

export default function ReviewExpense({ data, onSave, onRetake, onNavigate }: Props) {
    const isWarn = data.confidence === 'low' || data.confidence === 'medium'
    const [merchant, setMerchant] = useState(data.merchant)
    const [amount, setAmount] = useState(data.amount.toString())
    const [date, setDate] = useState(data.date)
    const [category, setCategory] = useState(data.category || CATEGORIES[0])
    const [notes, setNotes] = useState('')

    const title = isWarn ? 'Verify Details' : 'Review Expense'
    const hasItems = data.items && data.items.length > 0

    const handleSave = () => {
        onSave(merchant, parseFloat(amount) || 0, date, category)
    }

    return (
        <div className="app-shell">
            {/* Header */}
            <div className="page-header">
                <button className="header-btn" onClick={onRetake}><ArrowLeft size={20} /></button>
                <span className="header-title">{title}</span>
                <button className="header-btn"><MoreVertical size={20} /></button>
            </div>

            <div className="app-content" style={{ padding: '16px 20px 24px' }}>
                {/* Amount Hero */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div style={{
                            fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em',
                            color: 'var(--text-primary)',
                            padding: isWarn ? '12px 28px' : 0,
                            border: isWarn ? '2.5px solid var(--warning)' : 'none',
                            borderRadius: isWarn ? 20 : 0,
                            background: isWarn ? 'var(--warning-light)' : 'transparent',
                            lineHeight: 1.1,
                        }}>
                            Rp {Number(parseFloat(amount || '0')).toLocaleString('id-ID')}
                        </div>
                        {isWarn && (
                            <div style={{ position: 'absolute', top: -10, right: -10, width: 28, height: 28, borderRadius: 14, background: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={14} color="#fff" fill="#fff" />
                            </div>
                        )}
                        {!isWarn && <CheckCircle2 size={22} color="var(--success)" style={{ position: 'absolute', top: 8, right: -30 }} />}
                    </div>
                    {isWarn && (
                        <p style={{ marginTop: 8, color: 'var(--warning)', fontWeight: 500, fontSize: '0.875rem' }}>
                            This amount looks a bit blurry. Please verify.
                        </p>
                    )}
                    {!isWarn && (
                        <span className="confidence-badge high" style={{ marginTop: 10, display: 'inline-flex' }}>
                            <CheckCircle2 size={12} /> High Confidence ({data.confidenceScore}%)
                        </span>
                    )}
                </div>

                {isWarn && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                        <span className="confidence-badge low">
                            <AlertTriangle size={11} /> Confidence score: Low ({data.confidenceScore}%)
                        </span>
                    </div>
                )}

                {/* Receipt Items (from OCR) */}
                {hasItems && (
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: 16,
                        border: '1.5px solid var(--border)',
                        padding: '16px',
                        marginBottom: 20,
                    }}>
                        <p style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
                            Receipt Items ({data.items.length})
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {data.items.map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '8px 0',
                                    borderBottom: idx < data.items.length - 1 ? '1px solid var(--border)' : 'none',
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {item.name}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Qty: {item.qty}
                                        </p>
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                        Rp {item.price.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Amount (if warn, editable input) */}
                    {isWarn && (
                        <div className="form-group">
                            <label className="form-label">Total Amount</label>
                            <div className={`input-wrapper warning`}>
                                <div className="input-icon">Rp</div>
                                <input
                                    className="input-field"
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    style={{ fontWeight: 700, fontSize: '1.125rem' }}
                                />
                                <div className="input-status"><AlertTriangle size={16} color="var(--warning)" /></div>
                            </div>
                        </div>
                    )}

                    {/* Merchant */}
                    <div className="form-group">
                        <label className="form-label">Merchant</label>
                        <div className={`input-wrapper ${merchant ? 'verified' : ''}`}>
                            <div className="input-icon"><Store size={18} color="var(--primary)" /></div>
                            <input className="input-field" type="text" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="e.g. Restaurant Name" />
                            {merchant && <div className="input-status"><CheckCircle2 size={18} color="var(--success)" /></div>}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <div className="input-wrapper verified">
                            <div className="input-icon"><Calendar size={18} color="var(--text-muted)" /></div>
                            <input className="input-field" type="text" value={date} onChange={e => setDate(e.target.value)} />
                            <div className="input-status"><CheckCircle2 size={18} color="var(--success)" /></div>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <div className="input-wrapper">
                            <div className="input-icon"><Tag size={18} color="var(--text-muted)" /></div>
                            <select
                                className="input-field"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                style={{ appearance: 'none', cursor: 'pointer' }}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <div className="input-wrapper" style={{ alignItems: 'flex-start' }}>
                            <div className="input-icon" style={{ paddingTop: 14 }}><FileText size={18} color="var(--text-muted)" /></div>
                            <textarea
                                className="input-field"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Add a note..."
                                rows={3}
                                style={{ resize: 'none', paddingTop: 14 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom CTAs */}
                <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                    <button className="btn btn-secondary" onClick={onRetake} style={{ flexShrink: 0, width: 'auto', padding: '0 20px', gap: 6 }}>
                        <RotateCcw size={16} /> Retake
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} style={{ gap: 8 }}>
                        <CheckCircle2 size={18} /> Save Transaction
                    </button>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    🔒 Your data is securely encrypted
                </p>
            </div>

            <BottomNav active="expenses" onNavigate={onNavigate} />
        </div>
    )
}
