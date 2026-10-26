'use client'
import { useEffect, useRef } from 'react'

// Mỗi banner chạy trong iframe riêng — tránh conflict atOptions global
export default function AdsterraBanner({ adKey, width, height }) {
    const ref = useRef(null)
    const loaded = useRef(false)

    useEffect(() => {
        if (loaded.current || !ref.current) return
        loaded.current = true

        const iframe = document.createElement('iframe')
        iframe.style.width = `${width}px`
        iframe.style.height = `${height}px`
        iframe.style.border = 'none'
        iframe.scrolling = 'no'
        iframe.style.overflow = 'hidden'
        ref.current.appendChild(iframe)

        const doc = iframe.contentDocument || iframe.contentWindow.document
        doc.open()
        doc.write(`<!DOCTYPE html>
<html><head><style>body{margin:0;padding:0;overflow:hidden;}</style></head>
<body>
<script>
atOptions = {
    'key': '${adKey}',
    'format': 'iframe',
    'height': ${height},
    'width': ${width},
    'params': {}
};
</script>
<script src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
</body></html>`)
        doc.close()
    }, [adKey, width, height])

    return (
        <div
            ref={ref}
            style={{ width, minHeight: height }}
            className="flex justify-center mx-auto"
        />
    )
}
