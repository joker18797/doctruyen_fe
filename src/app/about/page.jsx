'use client'

import LayoutHeader from '@/components/LayoutHeader'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LayoutHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Về chúng tôi</h1>
        <p className="mb-2">
          Ổ Của Dưa là nền tảng đọc truyện trực tuyến miễn phí, nơi người dùng có thể thưởng thức hàng ngàn bộ truyện thuộc nhiều thể loại khác nhau. Mục tiêu của chúng tôi là tạo ra một không gian đọc truyện tiện lợi và thân thiện với người dùng.
        </p>
        <p className="mb-2">
          Chúng tôi cam kết cập nhật truyện mới liên tục, hỗ trợ cả hình thức đọc chữ và nghe audio nhằm mang đến trải nghiệm đa dạng cho người dùng.
        </p>
      </main>
      <Footer />
    </div>
  )
}
