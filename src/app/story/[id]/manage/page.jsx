'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Input, Modal, message, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import API from '@/Service/API'
import LayoutHeader from '@/components/LayoutHeader'
export default function ManageStoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const [story, setStory] = useState(null)
  const [chapters, setChapters] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newChapter, setNewChapter] = useState({ title: '', content: '', audio: null })
  const [audioPreview, setAudioPreview] = useState('')

  useEffect(() => {
    if (id) fetchStory(id)
  }, [id])

  const fetchStory = async (storyId) => {
    try {
      const res = await API.Story.detail(storyId)
      if (res?.status === 200) {
        setStory(res.data)
        setChapters(res.data.chapters || [])
      } else {
        message.error('Không tìm thấy truyện')
        router.push('/my-stories')
      }
    } catch (err) {
      message.error('Lỗi khi tải truyện')
    }
  }

  const handleAddChapter = async () => {
    if (!newChapter.title || !newChapter.content) {
      return message.error('Vui lòng nhập tiêu đề và nội dung chương')
    }
    try {
      const formData = new FormData()
      formData.append('title', newChapter.title)
      formData.append('content', newChapter.content)
      formData.append('story', id)
      if (newChapter.audio) {
        formData.append('audio', newChapter.audio)
      }
      const res = await API.Chapter.create(id, formData)
      if (res?.status === 201) {
        message.success('Đã thêm chương')
        fetchStory(id)
        setNewChapter({ title: '', content: '', audio: null })
        setAudioPreview('')
        setShowModal(false)
      } else {
        message.error('Thêm chương thất bại')
      }
    } catch (err) {
      message.error('Lỗi khi thêm chương')
    }
  }

  const handleDelete = async (chapterId) => {
    try {
      const res = await API.Chapter.delete(id, chapterId)
      if (res?.status === 200) {
        message.success('Đã xóa chương')
        fetchStory(id)
      } else {
        message.error('Xóa chương thất bại')
      }
    } catch (err) {
      message.error('Lỗi khi xóa chương')
    }
  }

  const handleAudioUpload = (info) => {
    const file = info.file.originFileObj
    if (file) {
      setNewChapter((prev) => ({ ...prev, audio: file }))
      setAudioPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div>
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">📘 Quản lý truyện: {story?.title}</h1>
            {story?.coverImage && <img src={process?.env?.NEXT_PUBLIC_URL_API + story.coverImage} alt="cover" className="h-40 mt-4 rounded shadow" />}
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Danh sách chương ({chapters.length})</h2>
            <Button type="primary" onClick={() => setShowModal(true)}>+ Thêm chương</Button>
          </div>

          {chapters.length === 0 ? (
            <p className="text-gray-500">Chưa có chương nào.</p>
          ) : (
            <div className="space-y-3">
              {chapters.map((chap, index) => (
                <div key={chap._id || index} className="bg-white p-4 rounded shadow flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">{`Chương ${index + 1}: ${chap.title}`}</h3>
                    {chap.audioUrl && <audio controls src={chap.audioUrl} className="mt-2" />}
                  </div>
                  <Button danger size="small" onClick={() => handleDelete(chap._id)}>Xóa</Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal
          title="Thêm chương mới"
          open={showModal}
          onOk={handleAddChapter}
          onCancel={() => setShowModal(false)}
          okText="Thêm"
          cancelText="Hủy"
        >
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Tiêu đề chương</label>
              <Input
                value={newChapter.title}
                onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                placeholder="Nhập tiêu đề"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Nội dung</label>
              <Input.TextArea
                rows={6}
                value={newChapter.content}
                onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
                placeholder="Nhập nội dung chương"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Tải lên audio (nếu có)</label>
              <Upload
                accept="audio/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAudioUpload}
              >
                <Button icon={<UploadOutlined />}>Chọn file audio</Button>
              </Upload>
              {audioPreview && <audio controls src={audioPreview} className="mt-2" />}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
