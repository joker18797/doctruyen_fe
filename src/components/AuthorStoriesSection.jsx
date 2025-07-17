'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Pagination, Popconfirm } from 'antd'
import { useSelector } from 'react-redux'
import { EyeOutlined } from '@ant-design/icons'
import API from '@/Service/API'
import { toast } from 'react-toastify'

const pageSize = 10

export default function AuthorStoriesSection({ authorId }) {
  const router = useRouter()
  const user = useSelector((state) => state.user.currentUser)
  const [stories, setStories] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchStories = async (page = 1) => {
    try {
      const res = await API.Story.list({
        author: authorId,
        page,
        limit: pageSize,
      })
      setStories(res.data.data)
      setTotal(res.data.pagination.total)
    } catch (err) {
      console.error('Lỗi khi lấy truyện tác giả:', err)
    }
  }

  useEffect(() => {
    if (authorId) fetchStories(currentPage)
  }, [authorId, currentPage])

  const handleClickStory = (storyId) => {
    router.push(`/story/${storyId}`)
  }

  const handleDeleteStory = async (id) => {
    try {
      await API.Story.delete(id)
      toast.success('Đã xóa truyện!')
      const newPage = (currentPage - 1) * pageSize >= total - 1 ? currentPage - 1 : currentPage
      setCurrentPage(Math.max(newPage, 1))
      fetchStories(newPage)
    } catch (err) {
      toast.error('Không thể xóa truyện')
    }
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">📚 Truyện của tác giả</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
        {stories.map((story) => (
          <div
            key={story._id}
            className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden hover:scale-[1.05] cursor-pointer relative"
            onClick={() => handleClickStory(story._id)}
          >
            <div className="relative">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full h-52 object-cover"
              />
              {story.isCompleted && (
                <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded shadow">
                  ✅ Hoàn thành
                </span>
              )}
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1 px-2">
                <EyeOutlined /> {story.totalRead || 0}
              </span>
            </div>

            <div className="p-4">
              <h2 className="text-[16px] font-semibold text-gray-800 line-clamp-2">{story.title}</h2>
            </div>

            {user?.role === 'admin' && (
              <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                <Popconfirm
                  title="Bạn có chắc muốn xóa truyện này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleDeleteStory(story._id)}
                >
                  <Button danger size="small">
                    Xoá
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>
        ))}
      </div>

      {total > pageSize && (
        <div className="mt-6 text-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  )
}
