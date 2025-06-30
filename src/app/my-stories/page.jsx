'use client'

import { Button, Modal, Pagination, message } from 'antd'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'

export default function MyStoriesPage() {
    const user = useSelector((state) => state.user.currentUser)

    const [stories, setStories] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0 })

    const fetchStories = async () => {
        try {
            const res = await API.Story.myStory({
                page: pagination.page,
                limit: pagination.limit
            })
            if (res?.status === 200) {
                setStories(res.data.data)
                setPagination((prev) => ({
                    ...prev,
                    total: res.data.pagination.total
                }))
            } else {
                message.error('Không thể tải truyện của bạn')
            }
        } catch (err) {
            message.error('Lỗi server: không thể lấy danh sách truyện')
        }
    }

    useEffect(() => {
        if (user) fetchStories()
    }, [user, pagination.page])

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, page }))
    }

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Bạn có chắc muốn xóa truyện này? Hành động này không thể hoàn tác.')
        if (!confirmed) return

        try {
            const res = await API.Story.delete(id)
            if (res?.status === 200) {
                message.success('Đã xóa truyện!')
                setStories((prev) => prev.filter((s) => s._id !== id))
            } else {
                message.error('Xóa thất bại!')
            }
        } catch (err) {
            message.error('Lỗi khi xóa truyện!')
        }
    }

    //   if (!user) {
    //     return <div className="text-center py-20 text-gray-500">Bạn cần đăng nhập để xem truyện của mình.</div>
    //   }

    return (
        <div>
            <LayoutHeader />
            <div className="min-h-screen bg-gray-50 py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">📚 Truyện của tôi</h1>
                        <Link href="/story/new">
                            <Button type="primary">+ Đăng truyện mới</Button>
                        </Link>
                    </div>

                    {stories.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Bạn chưa đăng truyện nào.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {stories.map((story) => (
                                    <div key={story._id} className="bg-white rounded-xl shadow hover:shadow-md transition">
                                        <img
                                            src={process.env.NEXT_PUBLIC_URL_API + story.coverImage}
                                            alt={story.title}
                                            className="w-full h-48 object-cover rounded-t-xl"
                                        />
                                        <div className="p-4">
                                            <h2 className="text-lg font-semibold text-gray-800 mb-1">{story.title}</h2>
                                            <p className="text-sm text-gray-500 mb-3">
                                                {story.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                                            </p>
                                            <div className="flex justify-between items-center space-x-2">
                                                <Link href={`/story/edit/${story._id}`}>
                                                    <Button size="small">Sửa</Button>
                                                </Link>
                                                <Link href={`/story/${story._id}/manage`}>
                                                    <Button size="small" type="dashed">Chương</Button>
                                                </Link>
                                                <Button onClick={() => handleDelete(story._id)} size="small" danger>
                                                    Xóa
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Pagination
                                    current={pagination.page}
                                    pageSize={pagination.limit}
                                    total={pagination.total}
                                    onChange={handlePageChange}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
