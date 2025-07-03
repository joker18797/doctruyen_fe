'use client'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-12 py-10 text-sm text-gray-700">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h4 className="text-lg font-bold mb-3 text-gray-800">Ổ Của Dưa</h4>
          <p className="text-gray-600">
            Trang web đọc truyện miễn phí, dành cho mọi lứa tuổi yêu thích văn học.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-lg font-bold mb-3 text-gray-800">Liên kết</h4>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:text-pink-600 transition-colors duration-200">
                Trang chủ
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-pink-600 transition-colors duration-200">
                Về chúng tôi
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-pink-600 transition-colors duration-200">
                Điều khoản
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-bold mb-3 text-gray-800">Liên hệ</h4>
          <ul className="space-y-2">
            <li>Email: <a href="mailto:jukarugi@gmail.com" className="text-blue-600 hover:underline">jukarugi@gmail.com</a></li>
            <li>
              Facebook:{" "}
              <a
                href="https://www.fb.com/share/1VCEh6hh4A/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Thích ăn dưa hấu
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="text-center mt-10 text-xs text-gray-500">
        © 2025 <span className="font-semibold text-gray-700">Ổ Của Dưa</span>. All rights reserved.
      </div>
    </footer>
  )
}
