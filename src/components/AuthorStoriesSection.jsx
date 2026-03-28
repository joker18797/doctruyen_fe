'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Pagination, Popconfirm } from 'antd'
import { useSelector } from 'react-redux'
import { EyeOutlined } from '@ant-design/icons'
import API from '@/Service/API'
import { toast } from 'react-toastify'

const pageSize = 10

export const AuthorStoriesSection = ({ authorId }) => {
  const router = useRouter()
  const user = useSelector((state) => state.user.currentUser)
  const [allStories, setAllStories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  // Gọi API 1 lần lấy tất cả truyện
  const fetchStories = async () => {
    try {
      const res = await API.Story.list({
        author: authorId,
        limit: 1000, // Số lớn để lấy gần như toàn bộ
      })
      setAllStories(res.data.data || [])
    } catch (err) {
      console.error('Lỗi khi lấy truyện tác giả:', err)
    }
  }

  useEffect(() => {
    if (authorId) fetchStories()
  }, [authorId])

  const handleClickStory = (story) => {
    router.push(`/story/${story.slug || story._id}`)
  }

  const handleDeleteStory = async (id) => {
    try {
      await API.Story.delete(id)
      toast.success('Đã xóa truyện!')
      const newList = allStories.filter((story) => story._id !== id)
      setAllStories(newList)
      const maxPage = Math.ceil(newList.length / pageSize)
      setCurrentPage((prev) => Math.min(prev, maxPage))
    } catch (err) {
      toast.error('Không thể xóa truyện')
    }
  }

  // Cắt dữ liệu theo trang hiện tại
  const pagedStories = allStories.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">📚 Truyện của tác giả</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
        {pagedStories.map((story) => (
          <div
            key={story._id}
            className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden hover:scale-[1.05] cursor-pointer relative"
            onClick={() => handleClickStory(story)}
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
              <h2 className="text-[16px] font-semibold text-gray-800">{story.title}</h2>
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

      {allStories.length > pageSize && (
        <div className="mt-6 text-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={allStories.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  )
}
