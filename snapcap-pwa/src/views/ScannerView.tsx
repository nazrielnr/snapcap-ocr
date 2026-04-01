import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Zap, Image as ImageIcon } from 'lucide-react'
import type { Translations } from '../i18n'

interface Props {
    onCapture: (blob: Blob) => void
    onClose: () => void
    t: Translations
}

export default function ScannerView({ onCapture, onClose, t }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [flash, setFlash] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [scanLine, setScanLine] = useState(0)
    const animRef = useRef<number>(0)
    const startRef = useRef<number>(0)

    // Scan line animation
    useEffect(() => {
        const animate = (ts: number) => {
            if (!startRef.current) startRef.current = ts
            const elapsed = (ts - startRef.current) % 3000
            const pct = elapsed < 1500 ? (elapsed / 1500) * 100 : 100 - ((elapsed - 1500) / 1500) * 100
            setScanLine(pct)
            animRef.current = requestAnimationFrame(animate)
        }
        animRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animRef.current)
    }, [])

    // Start camera
    useEffect(() => {
        let cancelled = false

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                    audio: false,
                })

                if (cancelled) {
                    stream.getTracks().forEach(t => t.stop())
                    return
                }

                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                    setCameraReady(true)
                }
            } catch (err: any) {
                if (!cancelled) {
                    console.error('Camera error:', err)
                    if (err.name === 'NotAllowedError') {
                        setCameraError('Camera access denied. Please allow camera permission.')
                    } else if (err.name === 'NotFoundError') {
                        setCameraError('No camera found. Use gallery to upload a photo.')
                    } else {
                        setCameraError('Could not access camera. Use gallery to upload a photo.')
                    }
                }
            }
        }

        startCamera()

        return () => {
            cancelled = true
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
                streamRef.current = null
            }
        }
    }, [])

    // Toggle flash/torch
    useEffect(() => {
        if (!streamRef.current) return
        const track = streamRef.current.getVideoTracks()[0]
        if (track && 'applyConstraints' in track) {
            try {
                track.applyConstraints({ advanced: [{ torch: flash } as any] })
            } catch { /* torch not supported */ }
        }
    }, [flash])

    // Capture photo from video
    const capturePhoto = useCallback(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(video, 0, 0)
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    // Stop camera
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(t => t.stop())
                    }
                    onCapture(blob)
                }
            },
            'image/jpeg',
            0.92
        )
    }, [onCapture])

    // Handle gallery file select
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Stop camera if running
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
        }
        onCapture(file)
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'linear-gradient(to bottom, #0a0a0a 0%, #1a1a1a 100%)',
            display: 'flex', flexDirection: 'column',
            zIndex: 200,
        }}>
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {/* Hidden file input for gallery */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px', paddingTop: 'calc(20px + env(safe-area-inset-top))' }}>
                <button
                    onClick={() => {
                        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
                        onClose()
                    }}
                    style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={20} color="#fff" />
                </button>
                <button
                    onClick={() => setFlash(f => !f)}
                    style={{ width: 44, height: 44, borderRadius: 22, background: flash ? '#FFD60A' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Zap size={20} color={flash ? '#000' : '#fff'} />
                </button>
            </div>

            {/* Viewfinder */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', gap: 24 }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {/* Real camera feed */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                        }}
                    />

                    {/* Camera error / loading overlay */}
                    {!cameraReady && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(135deg, rgba(60,50,40,0.9) 0%, rgba(40,35,30,0.95) 100%)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: 16, padding: 24,
                        }}>
                            {cameraError ? (
                                <>
                                    <p style={{ color: '#fff', fontSize: '0.9rem', textAlign: 'center', opacity: 0.8 }}>{cameraError}</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            padding: '10px 20px', borderRadius: 20,
                                            background: 'var(--primary)', color: '#fff',
                                            border: 'none', cursor: 'pointer', fontWeight: 600,
                                        }}
                                    >
                                        Upload from Gallery
                                    </button>
                                </>
                            ) : (
                                <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            )}
                        </div>
                    )}

                    {/* Frame corners */}
                    {[
                        { top: 0, left: 0, borderTop: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '12px 0 0 0' },
                        { top: 0, right: 0, borderTop: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 12px 0 0' },
                        { bottom: 0, left: 0, borderBottom: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '0 0 0 12px' },
                        { bottom: 0, right: 0, borderBottom: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 0 12px 0' },
                    ].map((s, i) => (
                        <div key={i} style={{ position: 'absolute', width: 28, height: 28, ...s }} />
                    ))}

                    {/* Scan line */}
                    {cameraReady && (
                        <div style={{
                            position: 'absolute', left: 8, right: 8, height: 2,
                            top: `${scanLine}%`,
                            background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                            borderRadius: 1, filter: 'blur(1px)',
                            boxShadow: '0 0 12px 3px rgba(0, 82, 255, 0.5)',
                            transition: 'top 0.05s linear',
                        }} />
                    )}
                </div>

                {/* Hint */}
                <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 24, padding: '10px 20px' }}>
                    <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 500 }}>{t.alignReceipt}</p>
                </div>
            </div>

            {/* Bottom controls */}
            <div style={{ padding: '0 32px 40px', paddingBottom: 'calc(40px + env(safe-area-inset-bottom))' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    {/* Gallery button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ImageIcon size={22} color="#fff" />
                    </button>
                    {/* Shutter */}
                    <button
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        style={{
                            width: 72, height: 72, borderRadius: 36,
                            background: cameraReady ? '#fff' : 'rgba(255,255,255,0.3)',
                            border: '4px solid rgba(255,255,255,0.4)',
                            cursor: cameraReady ? 'pointer' : 'not-allowed',
                            boxShadow: '0 0 0 6px rgba(255,255,255,0.15)',
                            transition: 'transform 0.1s var(--ease)',
                        }}
                        onMouseDown={e => { if (cameraReady) e.currentTarget.style.transform = 'scale(0.9)' }}
                        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                        aria-label="Capture receipt"
                    />
                    {/* Spacer */}
                    <div style={{ width: 48, height: 48 }} />
                </div>
            </div>
        </div>
    )
}
