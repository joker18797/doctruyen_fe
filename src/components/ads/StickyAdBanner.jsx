'use client'

import { useState, useEffect, useRef } from 'react'

// Adsterra ad keys
const AD_MOBILE_320x50  = '7c390bc8e5616f68ca6771dbd50db81f'  // 320×50 mobile
const AD_DESKTOP_728x90 = '9d6a2e1edd7202c169d77f9bcab62ab0'  // 728×90 desktop

/** Render một Adsterra banner bên trong iframe sandbox để tránh conflict global */
function AdsterraSlot({ adKey, width, height }) {
  const ref = useRef(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !ref.current) return
    loaded.current = true

    const iframe = document.createElement('iframe')
    iframe.style.width  = `${width}px`
    iframe.style.height = `${height}px`
    iframe.style.border = 'none'
    iframe.scrolling    = 'no'
    iframe.style.overflow = 'hidden'
    iframe.style.display  = 'block'
    ref.current.appendChild(iframe)

    const doc = iframe.contentDocument || iframe.contentWindow.document
    doc.open()
    doc.write(`<!DOCTYPE html>
<html><head><style>body{margin:0;padding:0;overflow:hidden;}</style></head>
<body>
<script>
atOptions = { 'key': '${adKey}', 'format': 'iframe', 'height': ${height}, 'width': ${width}, 'params': {} };
<\/script>
<script src="https://www.highperformanceformat.com/${adKey}/invoke.js"><\/script>
</body></html>`)
    doc.close()
  }, [adKey, width, height])

  return <div ref={ref} style={{ width, height, overflow: 'hidden' }} />
}

export default function StickyAdBanner() {
  const [topClosed, setTopClosed]       = useState(false)
  const [bottomClosed, setBottomClosed] = useState(false)
  const [isMobile, setIsMobile]         = useState(false)
  const [mounted, setMounted]           = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!mounted) return null

  const adKey    = isMobile ? AD_MOBILE_320x50 : AD_DESKTOP_728x90
  const adWidth  = isMobile ? 320 : 728
  const adHeight = 50   // cả 2 loại đều 50px cao

  const btnStyle = {
    background: '#e8470a',
    color: '#fff',
    border: 'none',
    borderRadius: '0 0 20px 20px',
    padding: '3px 18px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    lineHeight: '20px',
    display: 'inline-block',
    pointerEvents: 'auto',
    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
  }

  const btnStyleTop = { ...btnStyle, borderRadius: '0 0 20px 20px' }
  const btnStyleBottom = { ...btnStyle, borderRadius: '20px 20px 0 0' }

  return (
    <>
      {/* ========== TOP STICKY BANNER ========== */}
      {!topClosed && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto' }}>
            <AdsterraSlot adKey={adKey} width={adWidth} height={adHeight} />
          </div>
          <button style={btnStyleTop} onClick={() => setTopClosed(true)}>
            Tắt QC ✕
          </button>
        </div>
      )}

      {/* ========== BOTTOM STICKY BANNER ========== */}
      {!bottomClosed && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pointerEvents: 'none',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          <button style={btnStyleBottom} onClick={() => setBottomClosed(true)}>
            Tắt QC ✕
          </button>
          <div style={{ pointerEvents: 'auto' }}>
            {/* Dùng key khác để tránh load cùng 1 slot */}
            <AdsterraSlot adKey={adKey} width={adWidth} height={adHeight} />
          </div>
        </div>
      )}
    </>
  )
}
