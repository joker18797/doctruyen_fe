'use client'

import { useState, useEffect, useRef } from 'react'

// ——— Adsterra zone keys ———
const KEY_MOBILE_TOP     = '7c390bc8e5616f68ca6771dbd50db81f'  // 320×50 mobile top
const KEY_DESKTOP_TOP    = '9d6a2e1edd7202c169d77f9bcab62ab0'  // 728×90 desktop top
const KEY_MOBILE_BOTTOM  = '7c390bc8e5616f68ca6771dbd50db81f'  // thay key riêng nếu có
const KEY_DESKTOP_BOTTOM = '9d6a2e1edd7202c169d77f9bcab62ab0'  // thay key riêng nếu có

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

export default function StickyAdBanner() {
  const [topClosed, setTopClosed]       = useState(false)
  const [bottomClosed, setBottomClosed] = useState(false)
  const [topLoaded, setTopLoaded]       = useState(false)
  const [bottomLoaded, setBottomLoaded] = useState(false)
  const [isMobile, setIsMobile]         = useState(true)
  const [mounted, setMounted]           = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    setMounted(true)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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

  const wrapStyle = (pos) => ({
    position: 'fixed',
    [pos]: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
    ...(pos === 'bottom' ? { paddingBottom: 'env(safe-area-inset-bottom)' } : {}),
  })

  return (
    <>
      {/* ——— TOP ——— */}
      {!topClosed && (
        <div style={wrapStyle('top')}>
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
            <button style={btnTop} onClick={() => setTopClosed(true)}>
              Tắt QC ✕
            </button>
          )}
        </div>
      )}

      {/* ——— BOTTOM ——— */}
      {!bottomClosed && (
        <div style={wrapStyle('bottom')}>
          {/* Chỉ hiện nút sau khi ad đã load */}
          {bottomLoaded && (
            <button style={btnBottom} onClick={() => setBottomClosed(true)}>
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
