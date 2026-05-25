'use client'
import { Button, Input, Pagination, Select } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { useEffect, useState, useCallback } from 'react'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { toast } from 'react-toastify'

const { Option } = Select

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'published', label: '✅ Đã xuất bản' },
    { value: 'draft', label: '📝 Nháp' },
]

const COMPLETED_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'true', label: '🏁 Đã hoàn thành' },
    { value: 'false', label: '🔄 Đang tiến hành' },
]

const SORT_OPTIONS = [
    { value: 'newest', label: '🕒 Mới nhất' },
    { value: 'oldest', label: '📅 Cũ nhất' },
    { value: 'mostRead', label: '👁️ Đọc nhiều nhất' },
    { value: 'mostLiked', label: '❤️ Thích nhiều nhất' },
]

const DEFAULT_FILTERS = {
    search: '',
    status: '',
    isCompleted: '',
    sort: 'newest',
}

export default function MyStoriesPage() {
    const user = useSelector((state) => state.user.currentUser)

    const [isClient, setIsClient] = useState(false)
    const [stories, setStories] = useState([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0 })
    const [filters, setFilters] = useState(DEFAULT_FILTERS)
    const [searchInput, setSearchInput] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const MyPage = Number(localStorage.getItem('Page-My-Story')) || 1
            setPagination((prev) => ({ ...prev, page: MyPage }))
            setIsClient(true)
        }
    }, [])

    const fetchStories = useCallback(async (page, currentFilters) => {
        setLoading(true)
        try {
            const params = {
                page,
                limit: pagination.limit,
                ...currentFilters,
            }
            // Bỏ các param rỗng
            Object.keys(params).forEach((k) => {
                if (params[k] === '' || params[k] === null || params[k] === undefined) {
                    delete params[k]
                }
            })

            const res = await API.Story.myStory(params)
            if (res?.status === 200) {
                setStories(res.data.data)
                setPagination((prev) => ({
                    ...prev,
                    page,
                    total: res.data.pagination.total,
                }))
            } else {
                toast.error('Không thể tải truyện của bạn')
            }
        } catch (err) {
            toast.error('Lỗi server: không thể lấy danh sách truyện')
        } finally {
            setLoading(false)
        }
    }, [pagination.limit])

    useEffect(() => {
        if (user && isClient) {
            fetchStories(pagination.page, filters)
        }
    }, [user, isClient])

    const handleSearch = () => {
        const newFilters = { ...filters, search: searchInput }
        setFilters(newFilters)
        const newPage = 1
        localStorage.setItem('Page-My-Story', String(newPage))
        fetchStories(newPage, newFilters)
    }

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        const newPage = 1
        localStorage.setItem('Page-My-Story', String(newPage))
        fetchStories(newPage, newFilters)
    }

    const handleReset = () => {
        setFilters(DEFAULT_FILTERS)
        setSearchInput('')
        const newPage = 1
        localStorage.setItem('Page-My-Story', String(newPage))
        fetchStories(newPage, DEFAULT_FILTERS)
    }

    const handlePageChange = (page) => {
        localStorage.setItem('Page-My-Story', String(page))
        fetchStories(page, filters)
    }

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Bạn có chắc muốn xóa truyện này?')
        if (!confirmed) return

        try {
            const res = await API.Story.delete(id)
            if (res?.status === 200) {
                toast.success('Đã xóa truyện!')
                fetchStories(pagination.page, filters)
            } else {
                toast.error('Xóa thất bại!')
            }
        } catch (err) {
            toast.error('Lỗi khi xóa truyện!')
        }
    }

    const hasActiveFilter =
        filters.search || filters.status || filters.isCompleted || filters.sort !== 'newest'

    if (!isClient) return null

    return (
        <div>
            <LayoutHeader />
            <div className="min-h-screen bg-gray-50 py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">📚 Truyện của tôi</h1>
                        <Link href="/story/new">
                            <Button type="primary">+ Đăng truyện mới</Button>
                        </Link>
                    </div>

                    {/* Bộ lọc */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Tìm kiếm tiêu đề */}
                            <Input
                                allowClear
                                placeholder="🔍 Tìm theo tiêu đề..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onPressEnter={handleSearch}
                                onClear={() => {
                                    setSearchInput('')
                                    const newFilters = { ...filters, search: '' }
                                    setFilters(newFilters)
                                    fetchStories(1, newFilters)
                                }}
                                className="w-64"
                            />
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                            >
                                Tìm
                            </Button>

                            {/* Lọc trạng thái */}
                            <Select
                                value={filters.status}
                                onChange={(v) => handleFilterChange('status', v)}
                                className="w-44"
                                placeholder="Trạng thái"
                            >
                                {STATUS_OPTIONS.map((o) => (
                                    <Option key={o.value} value={o.value}>{o.label}</Option>
                                ))}
                            </Select>

                            {/* Lọc hoàn thành */}
                            <Select
                                value={filters.isCompleted}
                                onChange={(v) => handleFilterChange('isCompleted', v)}
                                className="w-48"
                                placeholder="Tình trạng"
                            >
                                {COMPLETED_OPTIONS.map((o) => (
                                    <Option key={o.value} value={o.value}>{o.label}</Option>
                                ))}
                            </Select>

                            {/* Sắp xếp */}
                            <Select
                                value={filters.sort}
                                onChange={(v) => handleFilterChange('sort', v)}
                                className="w-44"
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <Option key={o.value} value={o.value}>{o.label}</Option>
                                ))}
                            </Select>

                            {/* Reset */}
                            {hasActiveFilter && (
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleReset}
                                >
                                    Đặt lại
                                </Button>
                            )}
                        </div>

                        {/* Hiển thị tổng kết quả */}
                        <div className="mt-3 text-sm text-gray-500">
                            {loading ? 'Đang tải...' : `Tìm thấy ${pagination.total} truyện`}
                        </div>
                    </div>

                    {/* Danh sách truyện */}
                    {!loading && stories.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <div className="text-5xl mb-4">📭</div>
                            <p className="text-base">
                                {hasActiveFilter
                                    ? 'Không có truyện nào phù hợp với bộ lọc.'
                                    : 'Bạn chưa đăng truyện nào.'}
                            </p>
                            {hasActiveFilter && (
                                <Button className="mt-3" onClick={handleReset}>
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {stories.map((story) => (
                                    <div
                                        key={story._id}
                                        className="bg-white rounded-xl shadow hover:shadow-md transition"
                                    >
                                        <img
                                            src={story.coverImage}
                                            alt={story.title}
                                            className="w-full h-48 object-cover rounded-t-xl"
                                        />
                                        <div className="p-4">
                                            <h2 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                                                {story.title}
                                            </h2>
                                            <div className="flex flex-wrap gap-2 mb-2 text-xs">
                                                <span className={`px-2 py-0.5 rounded-full font-medium ${story.status === 'published'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {story.status === 'published' ? '✅ Xuất bản' : '📝 Nháp'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full font-medium ${story.isCompleted
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {story.isCompleted ? '🏁 Hoàn thành' : '🔄 Đang tiến hành'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3">
                                                👁️ {story.totalRead ?? 0} lượt đọc &nbsp;·&nbsp; ❤️ {story.likeCount ?? 0}
                                            </p>
                                            <div className="flex justify-between items-center space-x-2">
                                                <Link href={`/story/edit/${story._id}`}>
                                                    <Button size="small">Sửa</Button>
                                                </Link>
                                                <Link href={`/story/${story._id}/manage`}>
                                                    <Button size="small" type="dashed">Chương</Button>
                                                </Link>
                                                <Button
                                                    onClick={() => handleDelete(story._id)}
                                                    size="small"
                                                    danger
                                                >
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
                                    showSizeChanger={false}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
