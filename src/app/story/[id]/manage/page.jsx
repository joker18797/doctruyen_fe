'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Input, Modal, message, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

export default function ManageStoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const [story, setStory] = useState(null)
  const [chapters, setChapters] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newChapter, setNewChapter] = useState({ title: '', content: '', audio: '' })

  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem(`story-${id}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        setStory(parsed)
        setChapters(parsed.chapters || [])
      }
    }
  }, [id])

  const saveChapters = (nextChapters) => {
    const updated = { ...story, chapters: nextChapters }
    localStorage.setItem(`story-${id}`, JSON.stringify(updated))
    setChapters(nextChapters)
  }

  const handleAddChapter = () => {
    if (!newChapter.title || !newChapter.content) {
      return message.error('Vui lòng nhập tiêu đề và nội dung chương')
    }
    const next = [...chapters, newChapter]
    saveChapters(next)
    setNewChapter({ title: '', content: '', audio: '' })
    setShowModal(false)
    message.success('Đã thêm chương')
  }

  const handleDelete = (index) => {
    const next = chapters.filter((_, i) => i !== index)
    saveChapters(next)
    message.success('Đã xóa chương')
  }

  const handleAudioUpload = (info) => {
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      const url = URL.createObjectURL(info.file.originFileObj)
      setNewChapter((prev) => ({ ...prev, audio: url }))
    }
  }

//   if (!story) return <div className="text-center py-20 text-gray-500">Không tìm thấy truyện.</div>

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📘 Quản lý truyện: {story?.title}</h1>
          <img src={story?.cover} alt="cover" className="h-40 mt-4 rounded shadow" />
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
              <div key={index} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-800">{`Chương ${index + 1}: ${chap.title}`}</h3>
                  {chap.audio && <audio controls src={chap.audio} className="mt-2" />}
                </div>
                <Button danger size="small" onClick={() => handleDelete(index)}>Xóa</Button>
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
            {newChapter.audio && <audio controls src={newChapter.audio} className="mt-2" />}
          </div>
        </div>
      </Modal>
    </div>
  )
}
