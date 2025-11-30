'use client'
import { Button, Pagination, Select } from 'antd'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { toast } from 'react-toastify'

export default function MyStoriesPage() {
    const user = useSelector((state) => state.user.currentUser)

    const [isClient, setIsClient] = useState(false)
    const [stories, setStories] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0 })
    const [followFilter, setFollowFilter] = useState('all') // 'all' | 'followed' | 'notFollowed'

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const MyPage = Number(localStorage.getItem('Page-My-Story')) || 1
            setPagination((prev) => ({ ...prev, page: MyPage }))
            setIsClient(true)
        }
    }, [])

    const fetchStories = async () => {
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit
            }
            if (followFilter !== 'all') {
                params.followFilter = followFilter
            }
            const res = await API.Story.myStory(params)
            if (res?.status === 200) {
                setStories(res.data.data)
                setPagination((prev) => ({
                    ...prev,
                    total: res.data.pagination.total
                }))
            } else {
                toast.error('Không thể tải truyện của bạn')
            }
        } catch (err) {
            toast.error('Lỗi server: không thể lấy danh sách truyện')
        }
    }

    useEffect(() => {
        if (user && isClient) fetchStories()
    }, [user, pagination.page, isClient, followFilter])

    const handlePageChange = (page) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('Page-My-Story', page)
        }
        setPagination((prev) => ({ ...prev, page }))
    }

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Bạn có chắc muốn xóa truyện này?')
        if (!confirmed) return

        try {
            const res = await API.Story.delete(id)
            if (res?.status === 200) {
                toast.success('Đã xóa truyện!')
                setStories((prev) => prev.filter((s) => s._id !== id))
            } else {
                toast.error('Xóa thất bại!')
            }
        } catch (err) {
            toast.error('Lỗi khi xóa truyện!')
        }
    }

    const handleFollow = async (storyId, isFollowed) => {
        try {
            const res = isFollowed 
                ? await API.Story.unfollow({ story_id: storyId })
                : await API.Story.follow({ story_id: storyId })
            
            if (res?.status === 200) {
                toast.success(isFollowed ? 'Đã bỏ theo dõi' : 'Đã theo dõi')
                fetchStories() // Refresh list
            } else {
                toast.error(isFollowed ? 'Bỏ theo dõi thất bại' : 'Theo dõi thất bại')
            }
        } catch (err) {
            toast.error('Lỗi khi thao tác theo dõi!')
        }
    }

    const isStoryFollowed = (story) => {
        if (!story.followedBy || !user || !user._id) return false
        const userId = user._id.toString()
        return story.followedBy.some(id => {
            const followId = id?.toString ? id.toString() : (id?._id ? id._id.toString() : String(id))
            return followId === userId
        })
    }

    if (!isClient) return null // ⛔ Đợi tới khi client render mới tiếp tục

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            <LayoutHeader />
            
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
                                <span className="text-4xl">📚</span>
                                <span>Truyện của tôi</span>
                            </h1>
                            <p className="text-blue-100 text-sm sm:text-base">
                                Quản lý và theo dõi các truyện của bạn
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <Select
                                value={followFilter}
                                onChange={(value) => {
                                    setFollowFilter(value)
                                    setPagination((prev) => ({ ...prev, page: 1 }))
                                    if (typeof window !== 'undefined') {
                                        localStorage.setItem('Page-My-Story', '1')
                                    }
                                }}
                                className="w-full sm:w-48"
                                size="large"
                                options={[
                                    { value: 'all', label: '📋 Tất cả' },
                                    { value: 'followed', label: '⭐ Đã theo dõi' },
                                    { value: 'notFollowed', label: '📌 Chưa theo dõi' }
                                ]}
                            />
                            <Link href="/story/new" className="w-full sm:w-auto">
                                <Button 
                                    type="primary" 
                                    size="large"
                                    className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 border-0 font-semibold shadow-md hover:shadow-lg transition-all"
                                >
                                    <span className="text-lg mr-2">+</span>
                                    Đăng truyện mới
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {stories.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📖</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Chưa có truyện nào</h3>
                        <p className="text-gray-500 mb-6">Bắt đầu tạo truyện đầu tiên của bạn ngay bây giờ!</p>
                        <Link href="/story/new">
                            <Button type="primary" size="large" className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
                                <span className="text-lg mr-2">+</span>
                                Tạo truyện mới
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stories.map((story) => {
                                const isFollowed = isStoryFollowed(story)
                                return (
                                    <div 
                                        key={story._id} 
                                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                                    >
                                        {/* Cover Image */}
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={story.coverImage || '/placeholder-story.jpg'}
                                                alt={story.title}
                                                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                                                    story.status === 'published' 
                                                        ? 'bg-green-500 text-white' 
                                                        : 'bg-yellow-500 text-white'
                                                }`}>
                                                    {story.status === 'published' ? '✓ Đã xuất bản' : '📝 Nháp'}
                                                </span>
                                            </div>
                                            {isFollowed && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-lg flex items-center gap-1">
                                                        <span>⭐</span>
                                                        <span>Đã theo dõi</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h2 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {story.title}
                                            </h2>
                                            
                                            {/* Reading Statistics */}
                                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border border-gray-100">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 text-sm">📊</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Tổng</p>
                                                            <p className="text-sm font-bold text-gray-800">{story.totalRead ?? 0}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                            <span className="text-green-600 text-sm">📅</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Hôm nay</p>
                                                            <p className="text-sm font-bold text-gray-800">{story.dailyReadCount ?? 0}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                                            <span className="text-purple-600 text-sm">📆</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Tuần này</p>
                                                            <p className="text-sm font-bold text-gray-800">{story.weeklyReadCount ?? 0}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                                                            <span className="text-pink-600 text-sm">📆</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Tháng này</p>
                                                            <p className="text-sm font-bold text-gray-800">{story.monthlyReadCount ?? 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">📆 Năm này</span>
                                                        <span className="text-sm font-bold text-gray-800">{story.yearlyReadCount ?? 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-3 gap-2">
                                                    <Link href={`/story/edit/${story._id}`} className="flex-1">
                                                        <Button 
                                                            size="small" 
                                                            className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                                                        >
                                                            ✏️ Sửa
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/story/${story._id}/manage`} className="flex-1">
                                                        <Button 
                                                            size="small" 
                                                            type="dashed"
                                                            className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
                                                        >
                                                            📑 Chương
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        onClick={() => handleDelete(story._id)} 
                                                        size="small" 
                                                        danger
                                                        className="w-full"
                                                    >
                                                        🗑️ Xóa
                                                    </Button>
                                                </div>
                                                <Button 
                                                    onClick={() => handleFollow(story._id, isFollowed)}
                                                    size="small"
                                                    type={isFollowed ? 'default' : 'primary'}
                                                    block
                                                    className={`w-full font-semibold transition-all ${
                                                        isFollowed 
                                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300' 
                                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:from-blue-700 hover:to-purple-700'
                                                    }`}
                                                >
                                                    {isFollowed ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <span>✓</span>
                                                            <span>Đã theo dõi</span>
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <span>+</span>
                                                            <span>Theo dõi</span>
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="mt-10 flex justify-center">
                            <div className="bg-white rounded-xl shadow-md p-4">
                                <Pagination
                                    current={pagination.page}
                                    pageSize={pagination.limit}
                                    total={pagination.total}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    showQuickJumper
                                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} truyện`}
                                    className="custom-pagination"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
