'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input, Button, Select, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import API from '@/Service/API'

export default function EditStoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'draft',
    coverImage: '',
    coverFile: null
  })

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
          coverImage: process.env.NEXT_PUBLIC_URL_API + data.coverImage,
        }))
      }
    } catch (err) {
      message.error('Không tìm thấy truyện')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  
  const handleSubmit = async () => {
    if (!form.title) return message.error('Vui lòng nhập tiêu đề')

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('status', form.status)
    if (form.coverFile) {
      formData.append('coverImage', form.coverFile)
    }

    try {
      const res = await API.Story.update(id, formData)
      if (res?.status === 200) {
        message.success('Cập nhật truyện thành công!')
        router.push('/my-stories')
      }
    } catch (err) {
      message.error('Lỗi khi cập nhật truyện')
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
            <Input.TextArea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Nhập mô tả" />
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
            <Button type="primary" onClick={handleSubmit}>Lưu thay đổi</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
