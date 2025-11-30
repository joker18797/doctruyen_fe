'use client'

import { Badge, Dropdown, Empty, Button, Spin } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '@/Service/API'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotificationDropdown() {
    const user = useSelector((state) => state.user.currentUser)
    const router = useRouter()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const fetchNotifications = async () => {
        if (!user) return
        try {
            setLoading(true)
            const res = await API.Notification.list({ page: 1, limit: 10 })
            if (res?.status === 200) {
                setNotifications(res.data.data)
                setUnreadCount(res.data.unreadCount)
            }
        } catch (err) {
            console.error('Lỗi khi lấy thông báo:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchUnreadCount = async () => {
        if (!user) return
        try {
            const res = await API.Notification.unreadCount()
            if (res?.status === 200) {
                setUnreadCount(res.data.unreadCount)
            }
        } catch (err) {
            console.error('Lỗi khi lấy số lượng thông báo:', err)
        }
    }

    useEffect(() => {
        if (user) {
            fetchNotifications()
            fetchUnreadCount()
            // Polling mỗi 30 giây để cập nhật số lượng thông báo
            const interval = setInterval(fetchUnreadCount, 30000)
            return () => clearInterval(interval)
        }
    }, [user])

    const handleMarkAsRead = async (notificationId, e) => {
        e.stopPropagation()
        try {
            await API.Notification.markRead({ notificationId })
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (err) {
            console.error('Lỗi khi đánh dấu đã đọc:', err)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await API.Notification.markAllRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error('Lỗi khi đánh dấu tất cả đã đọc:', err)
        }
    }

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id, { stopPropagation: () => {} })
        }
        if (notification.storyId) {
            router.push(`/story/${notification.storyId}`)
            setOpen(false)
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

    if (!user) return null

    return (
        <Dropdown
            trigger={['click']}
            placement="bottomRight"
            open={open}
            onOpenChange={(visible) => {
                setOpen(visible)
                if (visible) {
                    fetchNotifications()
                }
            }}
            dropdownRender={() => (
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <BellOutlined />
                            Thông báo
                        </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <Spin />
                            </div>
                        ) : notifications.length === 0 ? (
                            <Empty
                                description="Chưa có thông báo nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                className="py-8"
                            />
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-3 cursor-pointer transition-all hover:bg-gray-50 ${
                                            !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`font-semibold text-sm ${!notification.isRead ? 'text-blue-700' : 'text-gray-800'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                                                {notification.storyId && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {notification.storyId.coverImage && (
                                                            <img
                                                                src={notification.storyId.coverImage}
                                                                alt={notification.storyId.title}
                                                                className="w-10 h-14 object-cover rounded"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-xs font-medium text-gray-700">
                                                                {notification.storyId.title}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">
                                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
                            </span>
                            {unreadCount > 0 && (
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={handleMarkAllAsRead}
                                    className="p-0 h-auto"
                                >
                                    Đánh dấu tất cả đã đọc
                                </Button>
                            )}
                        </div>
                        <Link href="/notifications" onClick={() => setOpen(false)}>
                            <Button type="primary" size="small" block>
                                Xem tất cả
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        >
            <Badge count={unreadCount} overflowCount={99} size="small">
                <Button
                    type="text"
                    icon={<BellOutlined className="text-lg" />}
                    className="flex items-center justify-center"
                    shape="circle"
                />
            </Badge>
        </Dropdown>
    )
}

