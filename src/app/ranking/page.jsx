'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { Card, Tabs, Spin, Empty, Badge, Select } from 'antd'
import { TrophyOutlined, CalendarOutlined, FireOutlined, StarOutlined, CrownOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { toast } from 'react-toastify'

export default function RankingPage() {
    const user = useSelector((state) => state.user.currentUser)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [stories, setStories] = useState([])
    const [activeTab, setActiveTab] = useState('daily')
    const [periodLabel, setPeriodLabel] = useState('Hôm nay')
    const [limit, setLimit] = useState(20)

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }
    }, [user, router])

    useEffect(() => {
        if (user) {
            fetchRanking()
        }
    }, [user, activeTab, limit])

    const fetchRanking = async () => {
        try {
            setLoading(true)
            const res = await API.Story.myRanking({ period: activeTab, limit })
            if (res?.status === 200) {
                setStories(res.data.data)
                setPeriodLabel(res.data.periodLabel)
            } else {
                toast.error('Không thể tải bảng xếp hạng')
            }
        } catch (err) {
            toast.error('Lỗi server: không thể lấy bảng xếp hạng')
        } finally {
            setLoading(false)
        }
    }

    const getRankIcon = (rank) => {
        if (rank === 1) return <CrownOutlined className="text-yellow-500 text-2xl" />
        if (rank === 2) return <TrophyOutlined className="text-gray-400 text-2xl" />
        if (rank === 3) return <TrophyOutlined className="text-orange-500 text-2xl" />
        return <span className="text-gray-600 font-bold text-lg">#{rank}</span>
    }

    const getRankBadgeColor = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500'
        if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600'
        return 'bg-gray-100'
    }

    const tabItems = [
        {
            key: 'daily',
            label: (
                <span className="flex items-center gap-2">
                    <CalendarOutlined />
                    <span>Hôm nay</span>
                </span>
            ),
        },
        {
            key: 'weekly',
            label: (
                <span className="flex items-center gap-2">
                    <CalendarOutlined />
                    <span>Tuần này</span>
                </span>
            ),
        },
        {
            key: 'monthly',
            label: (
                <span className="flex items-center gap-2">
                    <FireOutlined />
                    <span>Tháng này</span>
                </span>
            ),
        },
        {
            key: 'yearly',
            label: (
                <span className="flex items-center gap-2">
                    <StarOutlined />
                    <span>Năm này</span>
                </span>
            ),
        },
    ]

    if (!user) {
        return (
            <div>
                <LayoutHeader />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem bảng xếp hạng</p>
                        <Link href="/login">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Đăng nhập</button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            <LayoutHeader />
            
            {/* Header Section */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-lg">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-3xl sm:text-5xl hidden sm:block">🏆</div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                                <TrophyOutlined className="text-2xl sm:text-4xl" />
                                <span className="truncate">Bảng xếp hạng truyện</span>
                            </h1>
                            <p className="text-yellow-100 text-xs sm:text-sm lg:text-base">
                                Xem thứ hạng truyện của bạn theo {periodLabel.toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                <Card className="shadow-lg">
                    {/* Mobile: Select riêng */}
                    <div className="flex items-center justify-between mb-4 sm:hidden">
                        <span className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</span>
                        <Select
                            value={limit}
                            onChange={setLimit}
                            style={{ width: 100 }}
                            size="small"
                            options={[
                                { value: 15, label: '15 truyện' },
                                { value: 20, label: '20 truyện' },
                                { value: 30, label: '30 truyện' }
                            ]}
                        />
                    </div>
                    
                    {/* Desktop: Tabs và Select cùng dòng */}
                    <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabItems}
                            size="large"
                            className="flex-1"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</span>
                            <Select
                                value={limit}
                                onChange={setLimit}
                                style={{ width: 100 }}
                                options={[
                                    { value: 15, label: '15 truyện' },
                                    { value: 20, label: '20 truyện' },
                                    { value: 30, label: '30 truyện' }
                                ]}
                            />
                        </div>
                    </div>
                    
                    {/* Mobile: Tabs riêng */}
                    <div className="sm:hidden mb-4">
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabItems}
                            size="large"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Spin size="large" />
                        </div>
                    ) : stories.length === 0 ? (
                        <Empty
                            description="Chưa có dữ liệu xếp hạng"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            className="py-20"
                        />
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {stories.map((story, index) => (
                                <Link
                                    key={story._id}
                                    href={`/story/${story._id}`}
                                    className="block"
                                >
                                    <div
                                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all hover:shadow-lg ${
                                            index < 3
                                                ? `${getRankBadgeColor(story.rank)} text-white border-transparent`
                                                : 'bg-white border-gray-200 hover:border-blue-300'
                                        }`}
                                    >
                                        {/* Mobile Layout */}
                                        <div className="flex sm:hidden items-start gap-3">
                                            {/* Rank */}
                                            <div className="flex-shrink-0 w-10 text-center">
                                                {getRankIcon(story.rank)}
                                            </div>
                                            
                                            {/* Cover Image */}
                                            {story.coverImage && (
                                                <img
                                                    src={story.coverImage}
                                                    alt={story.title}
                                                    className="w-14 h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                                                />
                                            )}

                                            {/* Story Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-sm mb-1 line-clamp-2 ${
                                                    index < 3 ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                    {story.title}
                                                </h3>
                                                <div className="space-y-1 text-xs">
                                                    <div className={`flex items-center gap-1 ${
                                                        index < 3 ? 'text-yellow-100' : 'text-gray-600'
                                                    }`}>
                                                        <FireOutlined className="text-xs" />
                                                        <span className="font-semibold">{story.readCount.toLocaleString()}</span>
                                                        <span className="hidden xs:inline">lượt đọc {periodLabel.toLowerCase()}</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1 ${
                                                        index < 3 ? 'text-yellow-100' : 'text-gray-600'
                                                    }`}>
                                                        <TrophyOutlined className="text-xs" />
                                                        <span className="font-semibold">{story.totalRead.toLocaleString()}</span>
                                                        <span className="hidden xs:inline">tổng lượt đọc</span>
                                                    </div>
                                                    <Badge
                                                        status={story.status === 'published' ? 'success' : 'default'}
                                                        text={story.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                                                        className={index < 3 ? 'text-white' : ''}
                                                        size="small"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden sm:flex items-center gap-4">
                                            {/* Rank */}
                                            <div className="flex-shrink-0 w-16 text-center">
                                                {getRankIcon(story.rank)}
                                            </div>

                                            {/* Cover Image */}
                                            {story.coverImage && (
                                                <img
                                                    src={story.coverImage}
                                                    alt={story.title}
                                                    className="w-20 h-28 object-cover rounded-lg shadow-md flex-shrink-0"
                                                />
                                            )}

                                            {/* Story Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-base sm:text-lg mb-1 ${
                                                    index < 3 ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                    {story.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                                                    <div className={`flex items-center gap-1 ${
                                                        index < 3 ? 'text-yellow-100' : 'text-gray-600'
                                                    }`}>
                                                        <FireOutlined />
                                                        <span className="font-semibold">{story.readCount.toLocaleString()}</span>
                                                        <span>lượt đọc {periodLabel.toLowerCase()}</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1 ${
                                                        index < 3 ? 'text-yellow-100' : 'text-gray-600'
                                                    }`}>
                                                        <TrophyOutlined />
                                                        <span className="font-semibold">{story.totalRead.toLocaleString()}</span>
                                                        <span>tổng lượt đọc</span>
                                                    </div>
                                                    <Badge
                                                        status={story.status === 'published' ? 'success' : 'default'}
                                                        text={story.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                                                        className={index < 3 ? 'text-white' : ''}
                                                    />
                                                </div>
                                            </div>

                                            {/* Read Count Badge */}
                                            <div className={`hidden md:flex flex-shrink-0 text-center px-3 sm:px-4 py-2 rounded-lg ${
                                                index < 3 ? 'bg-white/20' : 'bg-blue-100'
                                            }`}>
                                                <div>
                                                    <div className={`text-xl sm:text-2xl font-bold ${
                                                        index < 3 ? 'text-white' : 'text-blue-600'
                                                    }`}>
                                                        {story.readCount.toLocaleString()}
                                                    </div>
                                                    <div className={`text-xs ${
                                                        index < 3 ? 'text-yellow-100' : 'text-gray-600'
                                                    }`}>
                                                        lượt đọc
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

