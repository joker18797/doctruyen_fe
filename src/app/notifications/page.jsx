'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { Button, Empty, Pagination, Spin, Badge, Tabs } from 'antd'
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { toast } from 'react-toastify'

export default function NotificationsPage() {
    const user = useSelector((state) => state.user.currentUser)
    const router = useRouter()
    const [isClient, setIsClient] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('all') // 'all' | 'unread' | 'read'

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsClient(true)
        }
    }, [])

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }
    }, [user, router])

    const fetchNotifications = async () => {
        if (!user) return
        try {
            setLoading(true)
            const params = {
                page: pagination.page,
                limit: pagination.limit
            }
            const res = await API.Notification.list(params)
            if (res?.status === 200) {
                let filteredNotifications = res.data.data
                let totalCount = res.data.pagination.total
                
                // Filter theo tab
                if (activeTab === 'unread') {
                    filteredNotifications = filteredNotifications.filter(n => !n.isRead)
                    totalCount = filteredNotifications.length
                } else if (activeTab === 'read') {
                    filteredNotifications = filteredNotifications.filter(n => n.isRead)
                    totalCount = filteredNotifications.length
                }
                
                setNotifications(filteredNotifications)
                setUnreadCount(res.data.unreadCount)
                setPagination(prev => ({
                    ...prev,
                    total: activeTab === 'all' ? res.data.pagination.total : totalCount
                }))
            } else {
                toast.error('Không thể tải thông báo')
            }
        } catch (err) {
            toast.error('Lỗi server: không thể lấy danh sách thông báo')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user && isClient) {
            // Reset về trang 1 khi đổi tab
            setPagination(prev => ({ ...prev, page: 1 }))
        }
    }, [activeTab, user, isClient])

    useEffect(() => {
        if (user && isClient) {
            fetchNotifications()
        }
    }, [user, pagination.page, isClient, activeTab])

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, page }))
    }

    const handleMarkAsRead = async (notificationId) => {
        try {
            await API.Notification.markRead({ notificationId })
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
            toast.success('Đã đánh dấu đã đọc')
        } catch (err) {
            toast.error('Lỗi khi đánh dấu đã đọc')
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await API.Notification.markAllRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
            toast.success('Đã đánh dấu tất cả đã đọc')
        } catch (err) {
            toast.error('Lỗi khi đánh dấu tất cả đã đọc')
        }
    }

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id)
        }
        if (notification.storyId) {
            router.push(`/story/${notification.storyId._id || notification.storyId}`)
        }
    }

    const formatTime = (date) => {
        try {
            const now = new Date()
            const notificationDate = new Date(date)
            const diffInSeconds = Math.floor((now - notificationDate) / 1000)
            
            if (diffInSeconds < 60) {
                return 'Vừa xong'
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60)
                return `${minutes} phút trước`
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600)
                return `${hours} giờ trước`
            } else if (diffInSeconds < 604800) {
                const days = Math.floor(diffInSeconds / 86400)
                return `${days} ngày trước`
            } else if (diffInSeconds < 2592000) {
                const weeks = Math.floor(diffInSeconds / 604800)
                return `${weeks} tuần trước`
            } else if (diffInSeconds < 31536000) {
                const months = Math.floor(diffInSeconds / 2592000)
                return `${months} tháng trước`
            } else {
                const years = Math.floor(diffInSeconds / 31536000)
                return `${years} năm trước`
            }
        } catch {
            return 'Vừa xong'
        }
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_story':
                return '📚'
            case 'new_chapter':
                return '📖'
            case 'system':
                return '🔔'
            default:
                return '📬'
        }
    }

    if (!isClient) return null

    if (!user) {
        return (
            <div>
                <LayoutHeader />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem thông báo</p>
                        <Link href="/login">
                            <Button type="primary">Đăng nhập</Button>
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
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
                                <BellOutlined className="text-4xl" />
                                <span>Thông báo</span>
                            </h1>
                            <p className="text-blue-100 text-sm sm:text-base">
                                Quản lý tất cả thông báo của bạn
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                type="primary"
                                size="large"
                                icon={<CheckOutlined />}
                                onClick={handleMarkAllAsRead}
                                className="bg-white text-blue-600 hover:bg-blue-50 border-0 font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                                Đánh dấu tất cả đã đọc
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Tabs */}
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: 'all',
                                label: (
                                    <span className="flex items-center gap-2">
                                        <span>Tất cả</span>
                                        <Badge count={pagination.total} showZero style={{ backgroundColor: '#52c41a' }} />
                                    </span>
                                ),
                            },
                            {
                                key: 'unread',
                                label: (
                                    <span className="flex items-center gap-2">
                                        <span>Chưa đọc</span>
                                        <Badge count={unreadCount} showZero style={{ backgroundColor: '#ff4d4f' }} />
                                    </span>
                                ),
                            },
                            {
                                key: 'read',
                                label: (
                                    <span className="flex items-center gap-2">
                                        <span>Đã đọc</span>
                                    </span>
                                ),
                            },
                        ]}
                        className="px-4 pt-4"
                    />

                    {/* Notifications List */}
                    <div className="p-4">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Spin size="large" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <Empty
                                description={
                                    activeTab === 'unread' 
                                        ? 'Không có thông báo chưa đọc' 
                                        : activeTab === 'read'
                                        ? 'Không có thông báo đã đọc'
                                        : 'Chưa có thông báo nào'
                                }
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                className="py-20"
                            />
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all hover:shadow-md border ${
                                                !notification.isRead
                                                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className="text-3xl flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className={`font-bold text-base ${
                                                                    !notification.isRead ? 'text-blue-700' : 'text-gray-800'
                                                                }`}>
                                                                    {notification.title}
                                                                </h3>
                                                                {!notification.isRead && (
                                                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                        {!notification.isRead && (
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<CheckOutlined />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleMarkAsRead(notification._id)
                                                                }}
                                                                className="flex-shrink-0"
                                                            >
                                                                Đánh dấu đã đọc
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Story Info */}
                                                    {notification.storyId && (
                                                        <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {notification.storyId.coverImage && (
                                                                <img
                                                                    src={notification.storyId.coverImage}
                                                                    alt={notification.storyId.title}
                                                                    className="w-16 h-24 object-cover rounded-lg shadow-sm flex-shrink-0"
                                                                />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-800 mb-1">
                                                                    {notification.storyId.title}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Click để xem chi tiết
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Time */}
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {formatTime(notification.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.total > pagination.limit && (
                                    <div className="mt-6 flex justify-center">
                                        <Pagination
                                            current={pagination.page}
                                            pageSize={pagination.limit}
                                            total={pagination.total}
                                            onChange={handlePageChange}
                                            showSizeChanger={false}
                                            showQuickJumper
                                            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} thông báo`}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

