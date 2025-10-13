// pages/terms.js
'use client'

import LayoutHeader from '@/components/LayoutHeader'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <LayoutHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 leading-relaxed">
        <h1 className="text-3xl font-bold mb-6 text-center">ĐIỀU KHOẢN SỬ DỤNG</h1>

        <p className="mb-4">
          <strong>Ổ của Dưa</strong> rất tự hào là nơi các cậu có thể giao lưu, chia sẻ những cảm nhận và ý kiến cá nhân, 
          cũng như đăng tải truyện mà mình đã bỏ công sức để dịch. 
          Tuy nhiên, xin lưu ý một vài điều nhỏ dưới đây để cùng nhau giữ cho ngôi nhà Dưa thật lành mạnh và vui vẻ nhé 🍉
        </p>

        <ul className="list-disc list-inside space-y-4">
          <li>
            <strong>Người dùng không được đăng tải nội dung vi phạm bản quyền hoặc trái pháp luật.</strong>
          </li>

          <li>
            <strong>Mọi truyện đăng tải cần đảm bảo: </strong> 
            không chứa nội dung phản cảm, đồi trụy hoặc vi phạm thuần phong mỹ tục. 
            Web của chúng mình là nơi chữa lành, giải tỏa căng thẳng, nên hy vọng sẽ không xuất hiện các nội dung 18+, 
            những nội dung tuyên truyền sai lệch sự thật, kích động bạo lực hoặc chiến tranh, 
            đặc biệt là những thông tin chống phá Đảng và Nhà nước Việt Nam hay gây hoang mang dư luận.
          </li>

          <li>
            <strong>Chúng tôi có quyền gỡ bỏ bất kỳ nội dung nào vi phạm chính sách mà không cần báo trước. </strong> 
            Những nội dung vi phạm sẽ được gỡ để đảm bảo môi trường giải trí lành mạnh, phù hợp với nhiều lứa tuổi.
          </li>

          <li>
            <strong>Thông tin người dùng được bảo mật theo chính sách riêng tư, </strong> 
            nhưng có thể bị xóa khi vi phạm điều khoản. 
            Tất cả thông tin cá nhân đều được giữ an toàn, nhưng nếu vi phạm, 
            tài khoản sẽ bị xoá vĩnh viễn để bảo vệ cộng đồng.
          </li>
        </ul>

        <p className="mt-6 text-center font-medium">
          Cảm ơn mọi người rất nhiều đã đồng hành cùng <strong>Ổ của Dưa</strong> 💚
        </p>
      </main>
      <Footer />
    </div>
  )
}
