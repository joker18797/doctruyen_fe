// components/Footer.js
'use client'

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-10 py-6 text-sm text-gray-600">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold mb-2">TruyenDoc</h4>
          <p>Trang web đọc truyện miễn phí dành cho mọi người.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Liên kết</h4>
          <ul className="space-y-1">
            <li><a href="/" className="hover:underline">Trang chủ</a></li>
            <li><a href="/about" className="hover:underline">Về chúng tôi</a></li>
            <li><a href="/terms" className="hover:underline">Điều khoản</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Liên hệ</h4>
          <p>Email: support@truyendoc.vn</p>
          <p>Facebook: fb.com/truyendoc</p>
        </div>
      </div>
      <div className="text-center mt-6 text-xs text-gray-400">
        © 2025 TruyenDoc. All rights reserved.
      </div>
    </footer>
  )
}
