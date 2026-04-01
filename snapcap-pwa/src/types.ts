export interface Transaction {
    id: string;
    merchant: string;
    amount: number;
    date: string;
    category: string;
    categoryIcon: string;
    categoryColor: string;
    status: 'verified' | 'pending';
}

export type AppView =
    | 'dashboard'
    | 'scanner'
    | 'processing'
    | 'review-high'
    | 'review-warn'
    | 'manual-entry'
    | 'success'
    | 'expenses'
    | 'reports'
    | 'profile';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'failed';

export interface ReceiptItem {
    name: string;
    qty: number;
    price: number;
}

export interface ScannedData {
    merchant: string;
    amount: number;
    date: string;
    category: string;
    confidence: ConfidenceLevel;
    confidenceScore: number;
    items: ReceiptItem[];
}

export interface OcrResponse {
    success: boolean;
    data: {
        merchant: string;
        items: ReceiptItem[];
        subtotal: number;
        tax: number;
        service: number;
        grand_total: number;
        date: string;
        raw_lines: string[];
        confidence: ConfidenceLevel;
        confidence_score: number;
    };
    processing_time_ms: number;
    error?: string;
}
