'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ——— Adsterra zone keys ———
const KEY_MOBILE_TOP     = '7c390bc8e5616f68ca6771dbd50db81f'  // 320×50 mobile top
const KEY_DESKTOP_TOP    = '9d6a2e1edd7202c169d77f9bcab62ab0'  // 728×90 desktop top
const KEY_MOBILE_BOTTOM  = '7c390bc8e5616f68ca6771dbd50db81f'  // thay key riêng nếu có
const KEY_DESKTOP_BOTTOM = '9d6a2e1edd7202c169d77f9bcab62ab0'  // thay key riêng nếu có

// ——— Cấu hình auto-dismiss ———
const AUTO_DISMISS_MS = 3000   // Tự tắt sau 3 giây (đủ để impression được tính CPM)
const SLIDE_OUT_MS    = 400    // Thời gian animation slide-out (ms)

/** Nhúng script Adsterra — gọi onLoad khi script đã load xong */
function AdsterraSlot({ adKey, width, height, slotId, onLoad }) {
  const containerRef = useRef(null)
  const injected = useRef(false)

  useEffect(() => {
    if (injected.current || !containerRef.current) return
    injected.current = true

    const optScript = document.createElement('script')
    optScript.text = `window['atOptions'] = { 'key': '${adKey}', 'format': 'iframe', 'height': ${height}, 'width': ${width}, 'params': {} };`
    containerRef.current.appendChild(optScript)

    const invScript = document.createElement('script')
    invScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`
    invScript.async = true
    // Hiện nút Tắt QC sau khi script load (hoặc lỗi) — ad đã render vào DOM
    invScript.onload  = () => { if (onLoad) onLoad() }
    invScript.onerror = () => { if (onLoad) onLoad() }
    containerRef.current.appendChild(invScript)
  }, [adKey, width, height, slotId, onLoad])

  return (
    <div
      id={slotId}
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px`, overflow: 'hidden' }}
    />
  )
}

/**
 * StickyAdBanner — hiển thị quảng cáo sticky top/bottom
 * Tự động ẩn sau AUTO_DISMISS_MS (3s) với animation slide-out mượt mà.
 * User vẫn có thể tắt sớm bằng nút "Tắt QC".
 * Impression vẫn được tính vì ad hiển thị đủ 2-3s trước khi ẩn.
 */
export default function StickyAdBanner() {
  // 'visible' | 'sliding-out' | 'closed'
  const [topState, setTopState]         = useState('visible')
  const [bottomState, setBottomState]   = useState('visible')
  const [topLoaded, setTopLoaded]       = useState(false)
  const [bottomLoaded, setBottomLoaded] = useState(false)
  const [isMobile, setIsMobile]         = useState(true)
  const [mounted, setMounted]           = useState(false)

  const topTimerRef    = useRef(null)
  const bottomTimerRef = useRef(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    setMounted(true)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // --- Hàm dismiss với animation ---
  const dismissBanner = useCallback((position) => {
    const setState = position === 'top' ? setTopState : setBottomState
    setState('sliding-out')
    setTimeout(() => setState('closed'), SLIDE_OUT_MS)
  }, [])

  // --- Auto-dismiss TOP sau khi ad load xong ---
  useEffect(() => {
    if (!topLoaded || topState !== 'visible') return
    topTimerRef.current = setTimeout(() => dismissBanner('top'), AUTO_DISMISS_MS)
    return () => clearTimeout(topTimerRef.current)
  }, [topLoaded, topState, dismissBanner])

  // --- Auto-dismiss BOTTOM sau khi ad load xong ---
  useEffect(() => {
    if (!bottomLoaded || bottomState !== 'visible') return
    bottomTimerRef.current = setTimeout(() => dismissBanner('bottom'), AUTO_DISMISS_MS)
    return () => clearTimeout(bottomTimerRef.current)
  }, [bottomLoaded, bottomState, dismissBanner])

  // --- Tắt thủ công (user bấm nút) ---
  const handleClose = (position) => {
    const timerRef = position === 'top' ? topTimerRef : bottomTimerRef
    clearTimeout(timerRef.current)
    dismissBanner(position)
  }

  if (!mounted) return null

  const topKey    = isMobile ? KEY_MOBILE_TOP    : KEY_DESKTOP_TOP
  const bottomKey = isMobile ? KEY_MOBILE_BOTTOM : KEY_DESKTOP_BOTTOM
  const adWidth   = isMobile ? 320 : 728
  const adHeight  = 50

  const btnBase = {
    background: '#e8470a',
    color: '#fff',
    border: 'none',
    padding: '3px 18px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    lineHeight: '20px',
    display: 'inline-block',
    pointerEvents: 'auto',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    whiteSpace: 'nowrap',
  }
  const btnTop    = { ...btnBase, borderRadius: '0 0 20px 20px' }
  const btnBottom = { ...btnBase, borderRadius: '20px 20px 0 0' }

  const wrapStyle = (pos, state) => ({
    position: 'fixed',
    [pos]: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
    // Animation: slide-out lên trên (top) hoặc xuống dưới (bottom)
    transform: state === 'sliding-out'
      ? (pos === 'top' ? 'translateY(-100%)' : 'translateY(100%)')
      : 'translateY(0)',
    opacity: state === 'sliding-out' ? 0 : 1,
    transition: `transform ${SLIDE_OUT_MS}ms ease-in-out, opacity ${SLIDE_OUT_MS}ms ease-in-out`,
    ...(pos === 'bottom' ? { paddingBottom: 'env(safe-area-inset-bottom)' } : {}),
  })

  return (
    <>
      {/* ——— TOP ——— */}
      {topState !== 'closed' && (
        <div style={wrapStyle('top', topState)}>
          <div style={{ pointerEvents: 'auto', lineHeight: 0 }}>
            <AdsterraSlot
              adKey={topKey}
              width={adWidth}
              height={adHeight}
              slotId="adt_sticky_top"
              onLoad={() => setTopLoaded(true)}
            />
          </div>
          {/* Chỉ hiện nút sau khi ad đã load */}
          {topLoaded && (
            <button style={btnTop} onClick={() => handleClose('top')}>
              Tắt QC ✕
            </button>
          )}
        </div>
      )}

      {/* ——— BOTTOM ——— */}
      {bottomState !== 'closed' && (
        <div style={wrapStyle('bottom', bottomState)}>
          {/* Chỉ hiện nút sau khi ad đã load */}
          {bottomLoaded && (
            <button style={btnBottom} onClick={() => handleClose('bottom')}>
              Tắt QC ✕
            </button>
          )}
          <div style={{ pointerEvents: 'auto', lineHeight: 0 }}>
            <AdsterraSlot
              adKey={bottomKey}
              width={adWidth}
              height={adHeight}
              slotId="adt_sticky_bottom"
              onLoad={() => setBottomLoaded(true)}
            />
          </div>
        </div>
      )}
    </>
  )
}
