import { useState, useEffect } from 'react'
import type { AppView, Transaction, ScannedData, OcrResponse } from './types'
import { translations, type Language } from './i18n'
import Dashboard from './views/Dashboard'
import ScannerView from './views/ScannerView'
import ProcessingView from './views/ProcessingView'
import ReviewExpense from './views/ReviewExpense'
import ManualEntry from './views/ManualEntry'
import SuccessModal from './views/SuccessModal'
import ExpensesView from './views/ExpensesView'
import ReportsView from './views/ReportsView'
import ProfileView from './views/ProfileView'

export default function App() {
  const [view, setView] = useState<AppView>('dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('snapcap_transactions')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [scannedData, setScannedData] = useState<ScannedData | null>(null)
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null)
  const [lastSaved, setLastSaved] = useState<{ merchant: string; amount: number } | null>(null)
  const [language, setLanguage] = useState<Language>('id')

  const t = translations[language]
  const navigate = (v: AppView) => setView(v)

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('snapcap_transactions', JSON.stringify(transactions))
  }, [transactions])

  // Real capture: receive a Blob from the camera/gallery
  const handleCapture = (blob: Blob) => {
    setCapturedImage(blob)
    navigate('processing')
  }

  // Upload image file directly (from Dashboard)
  const handleUpload = (file: File) => {
    setCapturedImage(file)
    navigate('processing')
  }

  // OCR result received from backend
  const handleOcrResult = (data: OcrResponse['data']) => {
    const scanned: ScannedData = {
      merchant: data.merchant || '',
      amount: data.grand_total || 0,
      date: data.date || new Date().toLocaleDateString(),
      category: guessCategory(data.items, data.merchant),
      confidence: data.confidence,
      confidenceScore: data.confidence_score,
      items: data.items || [],
    }
    setScannedData(scanned)

    if (data.confidence === 'high') {
      navigate('review-high')
    } else if (data.confidence === 'low') {
      navigate('review-warn')
    } else {
      navigate('manual-entry')
    }
  }

  // OCR processing failed
  const handleOcrError = () => {
    navigate('scanner')
  }

  const handleSaveTransaction = (merchant: string, amount: number, _date: string, category: string) => {
    const icons: Record<string, string> = {
      'Food & Dining': '☕', Groceries: '🛒', Transportation: '⛽', Entertainment: '🎬',
      Shopping: '🛍️', Health: '💊', Utilities: '⚡', Other: '📋'
    }
    const colors: Record<string, string> = {
      'Food & Dining': '#92400E', Groceries: '#065F46', Transportation: '#1E40AF',
      Entertainment: '#7C3AED', Shopping: '#BE185D', Health: '#0D9488',
      Utilities: '#B45309', Other: '#374151'
    }
    const newTx: Transaction = {
      id: String(Date.now()),
      merchant, amount, date: 'Today, just now', category,
      categoryIcon: icons[category] ?? '📋',
      categoryColor: colors[category] ?? '#374151',
      status: 'verified',
    }
    setTransactions(prev => [newTx, ...prev])
    setLastSaved({ merchant, amount })
    navigate('success')
  }

  switch (view) {
    case 'dashboard':
      return <Dashboard transactions={transactions} onScan={() => navigate('scanner')} onUpload={handleUpload} onNavigate={navigate} t={t} />
    case 'scanner':
      return <ScannerView onCapture={handleCapture} onClose={() => navigate('dashboard')} t={t} />
    case 'processing':
      return (
        <ProcessingView
          imageBlob={capturedImage!}
          onResult={handleOcrResult}
          onError={handleOcrError}
          onClose={() => navigate('dashboard')}
        />
      )
    case 'review-high':
      return <ReviewExpense data={scannedData!} onSave={handleSaveTransaction} onRetake={() => navigate('scanner')} onNavigate={navigate} />
    case 'review-warn':
      return <ReviewExpense data={scannedData!} onSave={handleSaveTransaction} onRetake={() => navigate('scanner')} onNavigate={navigate} />
    case 'manual-entry':
      return <ManualEntry onSave={handleSaveTransaction} onScanAgain={() => navigate('scanner')} onBack={() => navigate('dashboard')} />
    case 'success':
      return <SuccessModal merchant={lastSaved?.merchant ?? ''} amount={lastSaved?.amount ?? 0} onDismiss={() => navigate('dashboard')} onScanAnother={() => navigate('scanner')} t={t} />
    case 'expenses':
      return <ExpensesView transactions={transactions} onNavigate={navigate} onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} t={t} />
    case 'reports':
      return <ReportsView transactions={transactions} onNavigate={navigate} t={t} />
    case 'profile':
      return <ProfileView transactions={transactions} onNavigate={navigate} language={language} setLanguage={setLanguage} t={t} />
    default:
      return <Dashboard transactions={transactions} onScan={() => navigate('scanner')} onUpload={handleUpload} onNavigate={navigate} t={t} />
  }
}

/** Simple heuristic to guess category from receipt items/merchant */
function guessCategory(items: { name: string }[], merchant: string): string {
  const all = [...items.map(i => i.name), merchant].join(' ').toLowerCase()

  if (/coffee|cafe|kopi|restoran|restaurant|nasi|ayam|mie|teh|tea|makan|food|drink/i.test(all)) {
    return 'Food & Dining'
  }
  if (/grocery|supermarket|indomaret|alfamart|carrefour|sayur|buah/i.test(all)) {
    return 'Groceries'
  }
  if (/gas|fuel|bensin|pertamina|shell|transport|grab|gojek|taxi/i.test(all)) {
    return 'Transportation'
  }
  if (/movie|cinema|netflix|spotify|game|hiburan/i.test(all)) {
    return 'Entertainment'
  }
  if (/pharmacy|apotek|obat|health|dokter|rumah sakit/i.test(all)) {
    return 'Health'
  }
  if (/electric|listrik|pln|water|pdam|internet|wifi/i.test(all)) {
    return 'Utilities'
  }
  if (/mall|shop|toko|belanja|fashion/i.test(all)) {
    return 'Shopping'
  }
  return 'Food & Dining' // default for receipts
}
