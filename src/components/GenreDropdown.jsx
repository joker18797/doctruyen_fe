import { Dropdown, Button } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import Link from 'next/link'

const genres = [
  'Ngôn Tình', 'Tiên Hiệp', 'Xuyên Không', 'Hài Hước', 'Đô Thị', 'Đoản Văn', 'Lịch Sử', 'Trọng Sinh',
  'Linh Dị', 'Mạt Thế', 'Ngọt', 'HE', 'Cổ Đại', 'Gia Đình', 'Tổng Tài', 'Thanh Xuân', 'Nữ phụ',
  'Nam phụ lên ngôi', 'Nữ chính mạnh mẽ', 'Phục Thù', 'hôn nhân', 'Cổ Đại', 'Dị Giới', 'Đam Mỹ',
  'Ngược', 'Khác', 'Sủng', 'Huyền Huyễn', 'Phương Tây', 'Dị Năng', 'Trả Thù', 'Hiện Đại', 'Hệ Thống',
  'Vả Mặt', 'Chữa Lành', 'Nữ Cường', 'Gia Đấu', 'Sảng văn', 'Cung đấu', 'Plot twist', 'Ngoại tình', 'Tra nam'
]

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))

const genreChunks = chunk(genres, 10) // chia làm các cột

const GenreDropdown = () => {
  const items = [
    {
      key: 'genres',
      label: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 px-2 py-1">
          {genreChunks.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col space-y-1">
              {column.map((genre, i) => (
                <Link
                  key={i}
                  href={`/search?genre=${encodeURIComponent(genre)}`}
                  className="hover:text-violet-600 text-sm whitespace-nowrap"
                >
                  {genre}
                </Link>
              ))}
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <Dropdown menu={{ items }} trigger={['hover']}>
      <Button className="text-base font-semibold">
        Thể loại <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default GenreDropdown
