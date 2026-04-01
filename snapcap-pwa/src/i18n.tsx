export type Language = 'id' | 'en'

export interface Translations {
  // Navigation
  dashboard: string
  expenses: string
  reports: string
  profile: string
  
  // Dashboard
  todaysTotal: string
  monthlyTotal: string
  recentTransactions: string
  seeAll: string
  scanReceipt: string
  
  // Expenses
  allExpenses: string
  noExpenses: string
  delete: string
  verified: string
  pending: string
  
  // Reports
  monthlySpending: string
  byCategory: string
  noDataYet: string
  limit: string
  used: string
  
  // Profile
  receipts: string
  thisMonth: string
  saved: string
  settings: string
  language: string
  selectLanguage: string
  darkMode: string
  notifications: string
  exportData: string
  privacyPolicy: string
  termsOfService: string
  about: string
  version: string
  
  // Scanner
  pointCamera: string
  alignReceipt: string
  scanning: string
  
  // Processing
  processing: string
  analyzing: string
  
  // Review
  confirmExpense: string
  highConfidence: string
  lowConfidence: string
  looksBlurry: string
  pleaseVerify: string
  totalAmount: string
  merchant: string
  category: string
  date: string
  retake: string
  save: string
  editManually: string
  
  // Manual Entry
  addManually: string
  enterDetails: string
  scanAgain: string
  back: string
  
  // Success
  expenseSaved: string
  addedToTracker: string
  dismiss: string
  scanAnother: string
  
  // Camera Promo
  enableCamera: string
  scanToTrack: string
  skip: string
  enable: string
}

export const translations: Record<Language, Translations> = {
  id: {
    // Navigation
    dashboard: 'Beranda',
    expenses: 'Pengeluaran',
    reports: 'Laporan',
    profile: 'Profil',
    
    // Dashboard
    todaysTotal: 'Total Hari Ini',
    monthlyTotal: 'Total Bulanan',
    recentTransactions: 'Transaksi Terbaru',
    seeAll: 'Lihat Semua',
    scanReceipt: 'Scan Struk',
    
    // Expenses
    allExpenses: 'Semua Pengeluaran',
    noExpenses: 'Belum ada pengeluaran',
    delete: 'Hapus',
    verified: 'Terverifikasi',
    pending: 'Menunggu',
    
    // Reports
    monthlySpending: 'Pengeluaran Bulanan',
    byCategory: 'Per Kategori',
    noDataYet: 'Belum ada data - mulai scan struk!',
    limit: 'Limit',
    used: 'Terpakai',
    
    // Profile
    receipts: 'Struk',
    thisMonth: 'Bulan Ini',
    saved: 'Tersimpan',
    settings: 'Pengaturan',
    language: 'Bahasa',
    selectLanguage: 'Pilih Bahasa',
    darkMode: 'Mode Gelap',
    notifications: 'Notifikasi',
    exportData: 'Ekspor Data',
    privacyPolicy: 'Kebijakan Privasi',
    termsOfService: 'Ketentuan Layanan',
    about: 'Tentang',
    version: 'Versi',
    
    // Scanner
    pointCamera: 'Arahkan kamera ke struk',
    alignReceipt: 'Sejajarkan struk dalam bingkai',
    scanning: 'Memindai...',
    
    // Processing
    processing: 'Memproses...',
    analyzing: 'Menganalisis struk',
    
    // Review
    confirmExpense: 'Konfirmasi Pengeluaran',
    highConfidence: 'Kepercayaan Tinggi',
    lowConfidence: 'Kepercayaan Rendah',
    looksBlurry: 'Jumlah ini terlihat buram.',
    pleaseVerify: 'Silakan periksa.',
    totalAmount: 'Total Jumlah',
    merchant: 'Merchant',
    category: 'Kategori',
    date: 'Tanggal',
    retake: 'Ulangi',
    save: 'Simpan',
    editManually: 'Edit Manual',
    
    // Manual Entry
    addManually: 'Tambah Manual',
    enterDetails: 'Masukkan detail',
    scanAgain: 'Scan Lagi',
    back: 'Kembali',
    
    // Success
    expenseSaved: 'Pengeluaran Tersimpan!',
    addedToTracker: 'ditambahkan ke pelacak Anda.',
    dismiss: 'Tutup',
    scanAnother: 'Scan Lagi',
    
    // Camera Promo
    enableCamera: 'Aktifkan Kamera',
    scanToTrack: 'Scan struk untuk melacak pengeluaran dengan mudah',
    skip: 'Lewati',
    enable: 'Aktifkan',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    expenses: 'Expenses',
    reports: 'Reports',
    profile: 'Profile',
    
    // Dashboard
    todaysTotal: "Today's Total",
    monthlyTotal: 'Monthly Total',
    recentTransactions: 'Recent Transactions',
    seeAll: 'See All',
    scanReceipt: 'Scan Receipt',
    
    // Expenses
    allExpenses: 'All Expenses',
    noExpenses: 'No expenses yet',
    delete: 'Delete',
    verified: 'Verified',
    pending: 'Pending',
    
    // Reports
    monthlySpending: 'Monthly Spending',
    byCategory: 'By Category',
    noDataYet: 'No data yet - start scanning receipts!',
    limit: 'Limit',
    used: 'Used',
    
    // Profile
    receipts: 'Receipts',
    thisMonth: 'This Month',
    saved: 'Saved',
    settings: 'Settings',
    language: 'Language',
    selectLanguage: 'Select Language',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    exportData: 'Export Data',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    about: 'About',
    version: 'Version',
    
    // Scanner
    pointCamera: 'Point camera at receipt',
    alignReceipt: 'Align receipt within frame',
    scanning: 'Scanning...',
    
    // Processing
    processing: 'Processing...',
    analyzing: 'Analyzing receipt',
    
    // Review
    confirmExpense: 'Confirm Expense',
    highConfidence: 'High Confidence',
    lowConfidence: 'Low Confidence',
    looksBlurry: 'This amount looks a bit blurry.',
    pleaseVerify: 'Please verify.',
    totalAmount: 'Total Amount',
    merchant: 'Merchant',
    category: 'Category',
    date: 'Date',
    retake: 'Retake',
    save: 'Save',
    editManually: 'Edit Manually',
    
    // Manual Entry
    addManually: 'Add Manually',
    enterDetails: 'Enter details',
    scanAgain: 'Scan Again',
    back: 'Back',
    
    // Success
    expenseSaved: 'Expense Saved!',
    addedToTracker: 'added to your tracker.',
    dismiss: 'Dismiss',
    scanAnother: 'Scan Another',
    
    // Camera Promo
    enableCamera: 'Enable Camera',
    scanToTrack: 'Scan receipts to easily track expenses',
    skip: 'Skip',
    enable: 'Enable',
  },
}
