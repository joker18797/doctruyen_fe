'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input, Button, Select } from 'antd'
import API from '@/Service/API'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const allGenres = [
  'Bách Hợp', 'BE', 'Bình Luận Cốt Truyện', 'Chữa Lành', 'Cổ Đại', 'Cung Đấu', 'Cưới Trước Yêu Sau',
  'Cường Thủ Hào Đoạt', 'Dị Năng', 'Dưỡng Thê', 'Đam Mỹ', 'Điền Văn', 'Đô Thị', 'Đoản Văn', 'Đọc Tâm',
  'Gả Thay', 'Gia Đấu', 'Gia Đình', 'Gương Vỡ Không Lành', 'Gương Vỡ Lại Lành', 'Hài Hước', 'Hành Động',
  'Hào Môn Thế Gia', 'HE', 'Hệ Thống', 'Hiện Đại', 'Hoán Đổi Thân Xác', 'Học Bá', 'Học Đường',
  'Hư Cấu Kỳ Ảo', 'Huyền Huyễn', 'Không CP', 'Kinh Dị', 'Linh Dị', 'Mạt Thế', 'Mỹ Thực', 'Ngôn Tình',
  'Ngọt', 'Ngược', 'Ngược Luyến Tàn Tâm', 'Ngược Nam', 'Ngược Nữ', 'Nhân Thú', 'Niên Đại', 'Nữ Cường',
  'OE', 'Phép Thuật', 'Phiêu Lưu', 'Phương Đông', 'Phương Tây', 'Quy tắc', 'Sảng Văn', 'SE', 'Showbiz',
  'Sủng', 'Thanh Xuân Vườn Trường', 'Thức Tỉnh Nhân Vật', 'Tiên Hiệp', 'Tiểu Thuyết', 'Tổng Tài',
  'Trả Thù', 'Trinh thám', 'Trọng Sinh', 'Truy Thê', 'Vả Mặt', 'Vô Tri', 'Xuyên Không', 'Xuyên Sách'
]

export default function EditStoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'draft',
    coverImage: '',
    coverFile: null,
    genres: [],
    isCompleted: false,
    pin: false,
  })
  const user = useSelector((state) => state.user.currentUser)
  useEffect(() => {
    if (id) fetchData(id)
  }, [id])

  const fetchData = async (storyId) => {
    try {
      const res = await API.Story.detail(storyId)
      const data = res?.data
      if (data) {
        setForm((prev) => ({
          ...prev,
          title: data.title,
          description: data.description,
          status: data.status,
          coverImage: data.coverImage,
          isCompleted: !!data.isCompleted,
          pin: !!data.pin,
          genres: typeof data.genres === 'string' ? data.genres.split(',').map(g => g.trim()) : data.genres || [],
        }))
      }
    } catch (err) {
      toast.error('Không tìm thấy truyện')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!form.title) return toast.error('Vui lòng nhập tiêu đề')

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('status', form.status)
    formData.append('genres', form.genres.join(','))
    formData.append('isCompleted', form.isCompleted ? 'true' : 'false')
    if (form.coverFile) {
      formData.append('coverImage', form.coverFile)
    }

    try {
      const res = await API.Story.update(id, formData)
      if (res?.status === 200) {
        toast.success('Cập nhật truyện thành công!')
        router.push('/my-stories')
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật truyện')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">✏️ Chỉnh sửa truyện</h1>

        <div className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Tiêu đề</label>
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Nhập tiêu đề" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Mô tả</label>
            <Input.TextArea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Nhập mô tả"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Trạng thái</label>
            <Select
              value={form.status}
              onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
              className="w-40"
            >
              <Select.Option value="published">Xuất bản</Select.Option>
              <Select.Option value="draft">Nháp</Select.Option>
            </Select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Thể loại</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto border p-3 rounded bg-white">
              {allGenres.map((genre) => (
                <label key={genre} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.genres.includes(genre)}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setForm((prev) => ({
                        ...prev,
                        genres: checked
                          ? [...prev.genres, genre]
                          : prev.genres.filter((g) => g !== genre),
                      }))
                    }}
                  />
                  {genre}
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{form.genres.length} thể loại đã chọn</p>
          </div>
          <div>
            <label className="block mb-1 font-medium">Trạng thái hoàn thành</label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isCompleted}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isCompleted: e.target.checked }))
                }
              />
              Đã hoàn thành
            </label>
          </div>
          {user?.role === 'admin' && (
            <div>
              <label className="block mb-1 font-medium">Ghim truyện (pin)</label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.pin}
                  onChange={(e) => setForm((prev) => ({ ...prev, pin: e.target.checked }))}
                />
                Đánh dấu truyện là nổi bật (pin)
              </label>
            </div>
          )}
          <div>
            <label className="block mb-1 font-medium">Ảnh bìa</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setForm((prev) => ({
                    ...prev,
                    coverFile: file,
                    coverImage: URL.createObjectURL(file),
                  }))
                }
              }}
              className="w-full text-sm text-[black]"
            />
            {form.coverImage && <img src={form.coverImage} alt="preview" className="mt-3 h-40 rounded" />}
          </div>

          <div>
            <Button type="primary" onClick={handleSubmit}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
