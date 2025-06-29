
// pages/terms.js
'use client'

import LayoutHeader from '@/components/LayoutHeader'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LayoutHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Điều khoản sử dụng</h1>
        <ul className="list-disc list-inside space-y-2">
          <li>Người dùng không được đăng tải nội dung vi phạm bản quyền hoặc trái pháp luật.</li>
          <li>Mọi truyện đăng tải cần đảm bảo không chứa nội dung phản cảm, đồi trụy hoặc vi phạm thuần phong mỹ tục.</li>
          <li>Chúng tôi có quyền gỡ bỏ bất kỳ nội dung nào vi phạm chính sách mà không cần báo trước.</li>
          <li>Thông tin người dùng được bảo mật theo chính sách riêng tư, nhưng có thể bị xóa khi vi phạm điều khoản.</li>
        </ul>
      </main>
      <Footer />
    </div>
  )
}
