'use client'

import LayoutHeader from '@/components/LayoutHeader'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <LayoutHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 leading-relaxed">
        <h1 className="text-3xl font-bold mb-6 text-center">Về chúng tôi</h1>

        <p className="mb-4">
          Ổ Của Dưa được thành lập vào tháng 6/2024 bởi <strong>“Thích ăn dưa hấu”</strong> và <strong>Đồng Đồng!!!</strong>
        </p>

        <p className="mb-4">
          Từ nhỏ chúng tớ đã yêu thích đọc và viết, vẫn luôn mong muốn có một ngôi nhà của riêng mình, rốt cuộc sau bao ngày
          suy nghĩ, đắn đo thật kỹ và dốc hết tiền tiết kiệm thì <strong>Ổ của Dưa</strong> đã ra đời.
        </p>

        <p className="mb-4">
          Với mong muốn mang lại cho các cậu những phút giây thư giãn sau những giờ làm việc căng thẳng và mệt mỏi.
          Ở chỗ chúng tớ có rất nhiều những câu chuyện điền văn, chữa lành, vả mẹc chẹc chẹc, và cả hài hước dô tri
          dành cho tất cả các độc giả yêu quý!
        </p>

        <p className="mb-6">
          Đúng như tên web, hy vọng đây sẽ là nơi các cậu có thể nghỉ ngơi, để ăn một miếng mứt ngày xuân, 
          một miếng dưa hấu mát lạnh ngày hè, một miếng bánh mùa thu và một ly trà ngày đông. 
          Ngày này nối tiếp ngày kia, bốn mùa tự nhiên xoay chuyển, chúng tớ vẫn ở đây, 
          là một ngôi nhà nhỏ chờ các cậu trở về!
        </p>

        <h2 className="text-2xl font-semibold mb-3 mt-8">QUY ĐỊNH ĐỐI VỚI ĐỘC GIẢ:</h2>
        <p className="mb-4">
          Chào mừng các độc giả đã đến với Dưa! Dưa luôn trân trọng và cảm ơn tất cả mọi người đã đến với ngôi nhà chúng mình, 
          rất mong các cậu có thể cùng nhau chia sẻ, thưởng thức truyện tại đây. 
          Nhưng đồng thời cũng xin mọi người cẩn trọng phát ngôn.
        </p>
        <p className="mb-4">
          Dưa không chấp nhận những bình luận và phát ngôn liên quan đến phân biệt vùng miền, phỉ báng, kích động bạo lực chiến tranh,
          bôi nhọ Đảng và Nhà nước Việt Nam, truyền bá thông tin sai lệch hoặc dẫn link sang nền tảng khác.
          Những bình luận 18+ hay chứa từ ngữ không hợp thuần phong mỹ tục, chúng mình xin phép xoá khỏi ngôi nhà chung.
        </p>
        <p className="mb-6">
          Mong các cậu hãy cùng chúng mình xây dựng một cộng đồng đọc truyện vui vẻ, văn minh và thật lành mạnh!
        </p>

        <h2 className="text-2xl font-semibold mb-3 mt-8">ĐỐI VỚI DỊCH GIẢ:</h2>
        <p className="mb-4">
          Cảm ơn các cậu đã đến và đồng hành cùng với <strong>Ổ của Dưa</strong>! 
          Do chúng mình mới thành lập, mức kinh phí còn eo hẹp nên hiện tại chưa thể có kinh phí để trả cho công sức lao động của mọi người,
          chúng mình rất áy náy về điều này. Tuy nhiên, Dưa vẫn mong đây có thể là một sân chơi để các cậu thoả sức sáng tạo và tìm tòi bản thân.
        </p>
        <p className="mb-4">
          Những truyện đăng lên Ổ của Dưa, nếu các cậu cần PR có thể liên hệ trực tiếp qua email 
          <a href="mailto:jukarugi@gmail.com" className="text-blue-600 hover:underline ml-1">jukarugi@gmail.com</a>, 
          hoặc qua page <strong>Thích ăn dưa hấu</strong> (có gắn trên banner web) hoặc liên hệ <strong>Đồng Đồng</strong> để bọn mình hỗ trợ nhé.
        </p>

        <p className="mt-6 font-medium text-center">Cảm ơn các cậu rất nhiều!! 🍉</p>
      </main>
      <Footer />
    </div>
  )
}
