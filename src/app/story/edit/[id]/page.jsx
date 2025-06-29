'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input, Button, Select, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

export default function EditStoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const [story, setStory] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'draft',
    cover: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem(`story-${id}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      setStory(parsed)
      setForm({
        title: parsed.title || '',
        description: parsed.description || '',
        status: parsed.status || 'draft',
        cover: parsed.cover || '',
      })
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpload = (info) => {
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      const url = URL.createObjectURL(info.file.originFileObj)
      setForm((prev) => ({ ...prev, cover: url }))
    }
  }

  const handleSubmit = () => {
    if (!form.title || !form.cover) {
      return message.error('Vui lòng nhập tiêu đề và chọn ảnh bìa')
    }
    const updated = { ...story, ...form }
    localStorage.setItem(`story-${id}`, JSON.stringify(updated))
    message.success('Cập nhật truyện thành công!')
    router.push('/my-stories')
  }

//   if (!story) return <div className="text-center py-20 text-gray-500">Không tìm thấy truyện.</div>

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
            <Upload showUploadList={false} beforeUpload={() => false} onChange={handleUpload}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            {form.cover && <img src={form.cover} alt="preview" className="mt-3 h-40 rounded" />}
          </div>

          <div>
            <Button type="primary" onClick={handleSubmit}>Lưu thay đổi</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
