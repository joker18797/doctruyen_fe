'use client'
import { useEffect, useRef } from 'react'

export default function AdsterraNativeBanner() {
    const ref = useRef(null)
    const loaded = useRef(false)

    useEffect(() => {
        if (loaded.current || !ref.current) return
        loaded.current = true

        const script = document.createElement('script')
        script.async = true
        script.setAttribute('data-cfasync', 'false')
        script.src = 'https://pl29762369.effectivecpmnetwork.com/83a796fea94ce21845a57faafe16f54b/invoke.js'
        ref.current.appendChild(script)
    }, [])

    return (
        <div className="my-4 w-full">
            <div ref={ref} id="container-83a796fea94ce21845a57faafe16f54b" />
        </div>
    )
}
