'use client'
import { useEffect, useRef } from 'react'

// Mỗi instance dùng iframe riêng để tránh conflict atOptions global
export default function AdsterraBanner({ adKey, width, height }) {
    const ref = useRef(null)
    const loaded = useRef(false)

    useEffect(() => {
        if (loaded.current || !ref.current) return
        loaded.current = true

        // Dùng iframe trực tiếp thay vì atOptions global — tránh conflict khi nhiều banner cùng trang
        const iframe = document.createElement('iframe')
        iframe.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`
        iframe.style.width = `${width}px`
        iframe.style.height = `${height}px`
        iframe.style.border = 'none'
        iframe.scrolling = 'no'
        iframe.setAttribute('data-cfasync', 'false')

        // Dùng script inject đúng cách — mỗi script chạy độc lập trong closure riêng
        const wrapper = document.createElement('div')
        wrapper.style.width = `${width}px`
        wrapper.style.height = `${height}px`

        const configScript = document.createElement('script')
        configScript.type = 'text/javascript'
        // Dùng IIFE để tránh ghi đè atOptions global
        configScript.text = `;(function() {
            var atOptions = {
                'key': '${adKey}',
                'format': 'iframe',
                'height': ${height},
                'width': ${width},
                'params': {}
            };
            var d = document, s = d.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = 'https://www.highperformanceformat.com/${adKey}/invoke.js';
            s.setAttribute('data-cfasync', 'false');
            d.currentScript.parentNode.appendChild(s);
        })();`

        ref.current.appendChild(configScript)
    }, [adKey, width, height])

    return (
        <div
            ref={ref}
            style={{ width, minHeight: height, overflow: 'hidden' }}
            className="flex justify-center mx-auto"
        />
    )
}
