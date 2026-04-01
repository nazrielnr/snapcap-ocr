import { useState, useEffect, useRef } from 'react'
import { X, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react'
import type { OcrResponse } from '../types'

interface Props {
    imageBlob: Blob
    onResult: (data: OcrResponse['data']) => void
    onError: () => void
    onClose: () => void
}

type ProcessingStage = 'uploading' | 'detecting' | 'reading' | 'parsing' | 'done' | 'error'

const stageLabels: Record<ProcessingStage, string> = {
    uploading: 'Uploading image',
    detecting: 'Detecting receipt',
    reading: 'Reading text',
    parsing: 'Extracting data',
    done: 'Complete',
    error: 'Error',
}

const stageProgress: Record<ProcessingStage, number> = {
    uploading: 15,
    detecting: 35,
    reading: 60,
    parsing: 85,
    done: 100,
    error: 0,
}

export default function ProcessingView({ imageBlob, onResult, onError, onClose }: Props) {
    const [stage, setStage] = useState<ProcessingStage>('uploading')
    const [progress, setProgress] = useState(0)
    const [errorMsg, setErrorMsg] = useState('')
    const onResultRef = useRef(onResult)
    const onErrorRef = useRef(onError)
    const [previewUrl] = useState(() => URL.createObjectURL(imageBlob))

    // Keep refs in sync
    onResultRef.current = onResult
    onErrorRef.current = onError

    // Smooth progress animation toward target
    useEffect(() => {
        const target = stageProgress[stage]
        if (target === 0) return

        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= target) {
                    clearInterval(interval)
                    return target
                }
                return Math.min(p + 1, target)
            })
        }, 40)
        return () => clearInterval(interval)
    }, [stage])

    // Cleanup object URL
    useEffect(() => {
        return () => URL.revokeObjectURL(previewUrl)
    }, [previewUrl])

    // Upload and process - runs once
    useEffect(() => {
        let cancelled = false
        const controller = new AbortController()

        async function processImage() {
            try {
                setStage('uploading')

                const formData = new FormData()
                formData.append('file', imageBlob, 'receipt.jpg')

                // Stage progression timers (visual feedback while waiting)
                const timers = [
                    setTimeout(() => { if (!cancelled) setStage('detecting') }, 800),
                    setTimeout(() => { if (!cancelled) setStage('reading') }, 2000),
                    setTimeout(() => { if (!cancelled) setStage('parsing') }, 3500),
                ]

                const response = await fetch('/api/ocr', {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal,
                })

                timers.forEach(clearTimeout)

                if (cancelled) return

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`)
                }

                const result: OcrResponse = await response.json()

                if (cancelled) return

                if (!result.success) {
                    throw new Error(result.error || 'OCR processing failed')
                }

                setStage('done')
                setProgress(100)

                // Small delay for the "done" animation, then callback
                setTimeout(() => {
                    if (!cancelled) {
                        onResultRef.current(result.data)
                    }
                }, 600)

            } catch (err: any) {
                if (cancelled || err.name === 'AbortError') return

                console.error('Processing error:', err)
                setStage('error')
                setErrorMsg(err.message || 'Something went wrong')
            }
        }

        processImage()

        return () => {
            cancelled = true
            controller.abort()
        }
        // imageBlob is stable for this mount — no need for other deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageBlob])

    const isError = stage === 'error'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--bg-canvas)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px', paddingTop: 'calc(20px + env(safe-area-inset-top))' }}>
                <button
                    onClick={onClose}
                    style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-card)', border: '1.5px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={18} color="var(--text-secondary)" />
                </button>
                <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>Processing</span>
                <div style={{ width: 40 }} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', gap: 32 }}>
                {/* Receipt preview thumbnail */}
                <div style={{
                    width: '100%', maxWidth: 320,
                    background: 'var(--bg-card)',
                    borderRadius: 20,
                    padding: 0,
                    boxShadow: 'var(--shadow-md)',
                    overflow: 'hidden',
                    position: 'relative',
                    aspectRatio: '3/4',
                }}>
                    {/* Show captured image as preview */}
                    <img
                        src={previewUrl}
                        alt="Captured receipt"
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                            filter: isError ? 'grayscale(0.5) brightness(0.7)' : 'brightness(0.85)',
                        }}
                    />

                    {/* Animated scan overlay line */}
                    {!isError && stage !== 'done' && (
                        <div style={{
                            position: 'absolute', left: 0, right: 0, height: 3,
                            background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                            filter: 'blur(1px)',
                            top: `${progress}%`,
                            transition: 'top 0.05s linear',
                            boxShadow: '0 0 10px 4px rgba(0,82,255,0.3)',
                        }} />
                    )}

                    {/* Error overlay */}
                    {isError && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <AlertCircle size={48} color="var(--danger)" />
                        </div>
                    )}
                </div>

                {/* Status text */}
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                        {isError ? 'Processing Failed' : stage === 'done' ? 'Receipt Scanned!' : 'Reading your receipt...'}
                    </h3>
                    <p style={{ color: isError ? 'var(--danger)' : 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        {isError
                            ? errorMsg
                            : stage === 'done'
                                ? 'We successfully extracted the receipt data.'
                                : 'Hang tight while we extract the merchant, date, and total amount.'}
                    </p>
                </div>

                {/* Progress */}
                {!isError && (
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--primary)' }}>
                                <RefreshCw size={14} style={{ animation: stage !== 'done' ? 'spin 1.2s linear infinite' : 'none' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                    {stageLabels[stage]}
                                </span>
                            </div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{progress}%</span>
                        </div>
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {/* Error retry button */}
                {isError && (
                    <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                        <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={onError} style={{ flex: 1 }}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* Footer badge */}
                {!isError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)' }}>
                        <ShieldCheck size={14} />
                        <span style={{ fontSize: '0.75rem' }}>Your data is encrypted end-to-end.</span>
                    </div>
                )}
            </div>
        </div>
    )
}
