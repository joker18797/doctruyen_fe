'use client'
import { useEffect, useRef } from 'react'

// Banner có atOptions (320x50 và 728x90)
export default function AdsterraBanner({ adKey, width, height }) {
    const ref = useRef(null)
    const loaded = useRef(false)

    useEffect(() => {
        if (loaded.current || !ref.current) return
        loaded.current = true

        // Inject atOptions config
        const configScript = document.createElement('script')
        configScript.type = 'text/javascript'
        configScript.text = `
            atOptions = {
                'key': '${adKey}',
                'format': 'iframe',
                'height': ${height},
                'width': ${width},
                'params': {}
            };
        `
        ref.current.appendChild(configScript)

        // Inject invoke script
        const invokeScript = document.createElement('script')
        invokeScript.type = 'text/javascript'
        invokeScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`
        invokeScript.async = true
        ref.current.appendChild(invokeScript)
    }, [adKey, width, height])

    return (
        <div
            ref={ref}
            style={{ width, minHeight: height, overflow: 'hidden' }}
            className="flex justify-center mx-auto"
        />
    )
}
