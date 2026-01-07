// pages/privacy.js
'use client'

import LayoutHeader from '@/components/LayoutHeader'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <LayoutHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 leading-relaxed">
        <h1 className="text-3xl font-bold mb-6 text-center">CHÍNH SÁCH QUYỀN RIÊNG TƯ</h1>

        <p className="mb-4">
          <strong>Ổ của Dưa</strong> cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng. 
          Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của bạn khi sử dụng dịch vụ của chúng tôi.
        </p>

        <h2 className="text-2xl font-semibold mb-3 mt-8">1. THÔNG TIN CHÚNG TÔI THU THẬP</h2>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>
            <strong>Thông tin đăng ký tài khoản:</strong> Tên người dùng, email, mật khẩu (được mã hóa), 
            và các thông tin khác bạn cung cấp khi đăng ký.
          </li>
          <li>
            <strong>Thông tin sử dụng:</strong> Lịch sử đọc truyện, truyện yêu thích, bình luận, 
            và các tương tác khác trên website.
          </li>
          <li>
            <strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thiết bị sử dụng, 
            và dữ liệu cookie để cải thiện trải nghiệm người dùng.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3 mt-8">2. CÁCH CHÚNG TÔI SỬ DỤNG THÔNG TIN</h2>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Cung cấp và cải thiện dịch vụ đọc truyện của chúng tôi.</li>
          <li>Gửi thông báo về truyện mới, chương mới hoặc các cập nhật quan trọng.</li>
          <li>Bảo vệ quyền lợi và an toàn của người dùng, phát hiện và ngăn chặn các hành vi vi phạm.</li>
          <li>Phân tích và cải thiện trải nghiệm người dùng trên website.</li>
          <li>Tuân thủ các yêu cầu pháp lý và quy định hiện hành.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3 mt-8">3. BẢO MẬT THÔNG TIN</h2>
        <p className="mb-4">
          Chúng tôi sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Mã hóa mật khẩu bằng thuật toán bảo mật cao.</li>
          <li>Bảo vệ dữ liệu bằng các công nghệ firewall và mã hóa SSL/TLS.</li>
          <li>Giới hạn quyền truy cập thông tin chỉ cho nhân viên có trách nhiệm.</li>
          <li>Thường xuyên kiểm tra và cập nhật hệ thống bảo mật.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3 mt-8">4. CHIA SẺ THÔNG TIN</h2>
        <p className="mb-4">
          Chúng tôi <strong>KHÔNG</strong> bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, 
          trừ các trường hợp sau:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Khi có yêu cầu từ cơ quan pháp luật hoặc tòa án.</li>
          <li>Khi cần bảo vệ quyền lợi, tài sản hoặc an toàn của Ổ của Dưa và người dùng.</li>
          <li>Với sự đồng ý rõ ràng của bạn.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3 mt-8">5. QUYỀN CỦA NGƯỜI DÙNG</h2>
        <p className="mb-4">Bạn có quyền:</p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Truy cập và xem thông tin cá nhân của mình.</li>
          <li>Chỉnh sửa hoặc cập nhật thông tin tài khoản bất cứ lúc nào.</li>
          <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân (theo quy định pháp luật).</li>
          <li>Từ chối nhận thông báo hoặc email marketing (nếu có).</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3 mt-8">6. COOKIE VÀ CÔNG NGHỆ THEO DÕI</h2>
        <p className="mb-4">
          Website sử dụng cookie để lưu trữ thông tin đăng nhập, tùy chọn người dùng, 
          và cải thiện trải nghiệm sử dụng. Bạn có thể tắt cookie trong cài đặt trình duyệt, 
          nhưng điều này có thể ảnh hưởng đến một số chức năng của website.
        </p>

        <h2 className="text-2xl font-semibold mb-3 mt-8">7. LIÊN KẾT ĐẾN WEBSITE KHÁC</h2>
        <p className="mb-4">
          Website của chúng tôi có thể chứa các liên kết đến website bên thứ ba (ví dụ: Shopee, Facebook). 
          Chúng tôi không chịu trách nhiệm về chính sách quyền riêng tư của các website này. 
          Vui lòng đọc kỹ chính sách quyền riêng tư của các website đó khi truy cập.
        </p>

        <h2 className="text-2xl font-semibold mb-3 mt-8">8. THAY ĐỔI CHÍNH SÁCH</h2>
        <p className="mb-4">
          Chúng tôi có thể cập nhật chính sách này theo thời gian. Mọi thay đổi sẽ được thông báo 
          trên website và có hiệu lực ngay sau khi được đăng tải. Việc bạn tiếp tục sử dụng dịch vụ 
          sau khi chính sách được cập nhật được coi là bạn đã đồng ý với các thay đổi đó.
        </p>

        <h2 className="text-2xl font-semibold mb-3 mt-8">9. LIÊN HỆ</h2>
        <p className="mb-4">
          Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về chính sách quyền riêng tư này, 
          vui lòng liên hệ với chúng tôi qua:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Email: <a href="mailto:jukarugi@gmail.com" className="text-blue-600 hover:underline">jukarugi@gmail.com</a></li>
          <li>
            Facebook:{" "}
            <a
              href="https://www.facebook.com/profile.php?id=61555754257080"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Thích ăn dưa hấu
            </a>
          </li>
        </ul>

        <p className="mt-6 text-center font-medium">
          Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của <strong>Ổ của Dưa</strong>! 🍉
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </p>
      </main>
      <Footer />
    </div>
  )
}

