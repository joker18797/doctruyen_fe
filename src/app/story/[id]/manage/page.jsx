'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Input, Modal, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import API from '@/Service/API'
import LayoutHeader from '@/components/LayoutHeader'
import { toast } from 'react-toastify'

export default function ManageStoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const [story, setStory] = useState(null)
  const [chapters, setChapters] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newChapter, setNewChapter] = useState({ title: '', content: '', audio: null })
  const [audioPreview, setAudioPreview] = useState('')
  const [editingChapter, setEditingChapter] = useState(null)
  const isEditing = !!editingChapter

  useEffect(() => {
    if (id) fetchStory(id)
  }, [id])

  const fetchStory = async (storyId) => {
    try {
      const res = await API.Story.detail(storyId)
      if (res?.status === 200) {
        setStory(res.data)
        const res1 = await API.Chapter.list(storyId, { page: 1, limit: 100000 })
        if (res1?.status === 200) {
          setChapters(res1.data.data || [])
        }
      } else {
        toast.error('Không tìm thấy truyện')
        router.push('/my-stories')
      }
    } catch (err) {
      toast.error('Lỗi khi tải truyện')
    }
  }

  const handleSubmitChapter = async () => {
    if (!newChapter.title || !newChapter.content) {
      return toast.error('Vui lòng nhập tiêu đề và nội dung chương')
    }

    try {
      const formData = new FormData()
      formData.append('title', newChapter.title)
      formData.append('content', newChapter.content)
      if (newChapter.audio) {
        formData.append('audio', newChapter.audio)
      }

      let res
      if (isEditing) {
        res = await API.Chapter.update(id, editingChapter._id, formData)
      } else {
        formData.append('story', id)
        res = await API.Chapter.create(id, formData)
      }

      if (res?.status === 200 || res?.status === 201) {
        toast.success(isEditing ? 'Đã cập nhật chương' : 'Đã thêm chương')
        fetchStory(id)
        setNewChapter({ title: '', content: '', audio: null })
        setAudioPreview('')
        setShowModal(false)
        setEditingChapter(null)
      } else {
        toast.error(isEditing ? 'Cập nhật thất bại' : 'Thêm chương thất bại')
      }
    } catch (err) {
      toast.error(isEditing ? 'Lỗi khi cập nhật chương' : 'Lỗi khi thêm chương')
    }
  }

  const handleDelete = async (chapterId) => {
  const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa chương này?')
  if (!confirmDelete) return

  try {
    const res = await API.Chapter.delete(id, chapterId)
    if (res?.status === 200) {
      toast.success('Đã xóa chương')
      fetchStory(id)
    } else {
      toast.error('Xóa chương thất bại')
    }
  } catch (err) {
    toast.error('Lỗi khi xóa chương')
  }
}


  const handleAudioUpload = (info) => {
    const file = info.file
    if (file) {
      setNewChapter((prev) => ({ ...prev, audio: file }))
      setAudioPreview(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setNewChapter({ title: '', content: '', audio: null })
    setAudioPreview('')
    setEditingChapter(null)
    setShowModal(false)
  }

  return (
    <div>
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              📘 Quản lý truyện: {story?.title} 
            </h1>
            {story?.coverImage && (
              <img
                src={process.env.NEXT_PUBLIC_URL_API + story.coverImage}
                alt="cover"
                className="h-40 mt-4 rounded shadow"
              />
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Danh sách chương ({chapters.length})</h2>
            <Button
              type="primary"
              onClick={() => {
                setShowModal(true)
                setEditingChapter(null)
                setNewChapter({ title: '', content: '', audio: null })
                setAudioPreview('')
              }}
            >
              + Thêm chương
            </Button>
          </div>

          {chapters.length === 0 ? (
            <p className="text-gray-500">Chưa có chương nào.</p>
          ) : (
            <div className="space-y-3">
              {chapters.map((chap, index) => (
                <div
                  key={chap._id || index}
                  className="bg-white p-4 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {`Chương ${chap.order || index + 1}: ${chap.title}`}
                    </h3>
                    {chap.audio && (
                      <audio controls src={ chap.audio} className="mt-2" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingChapter(chap)
                        setNewChapter({
                          title: chap.title || '',
                          content: chap.content || '',
                          audio: null,
                        })
                        setAudioPreview(chap.audio ? ( chap.audio) : null )
                        setShowModal(true)
                      }}
                    >
                      Sửa
                    </Button>
                    <Button danger size="small" onClick={() => handleDelete(chap._id)}>
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal
          title={isEditing ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
          open={showModal}
          onOk={handleSubmitChapter}
          onCancel={resetForm}
          okText={isEditing ? 'Cập nhật' : 'Thêm'}
          cancelText="Hủy"
          width={800}
        >
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Tiêu đề chương</label>
              <Input
                value={newChapter.title}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, title: e.target.value })
                }
                placeholder="Nhập tiêu đề"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Nội dung</label>
              <Input.TextArea
                rows={6}
                value={newChapter.content}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, content: e.target.value })
                }
                placeholder="Nhập nội dung chương"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {newChapter.content.trim() === ''
                  ? '0 từ'
                  : `${newChapter.content.trim().split(/\s+/).length} từ`}
              </div>
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
