'use client'

import { Button } from 'antd'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import LayoutHeader from '@/components/LayoutHeader'

export default function MyStoriesPage() {
    const user = useSelector((state) => state.user.currentUser)
    const [stories, setStories] = useState([])

    useEffect(() => {
        if (user) {
            // Dữ liệu giả lập
            setStories([
                { id: 1, title: 'Truyện của tôi 1', cover: '/cover1.jpg', status: 'Đã xuất bản' },
                { id: 2, title: 'Truyện nháp 2', cover: '/cover2.jpg', status: 'Nháp' },
            ])
        }
    }, [user])

    if (!user) {
        return <div className="text-center py-20 text-gray-500">Bạn cần đăng nhập để xem truyện của mình.</div>
    }

    return (
        <div>
            <LayoutHeader />
            <div className="min-h-screen bg-gray-50 py-10 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">📚 Truyện của tôi</h1>
                        <Link href="/story/new">
                            <Button type="primary">+ Đăng truyện mới</Button>
                        </Link>
                    </div>

                    {stories.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Bạn chưa đăng truyện nào.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {stories.map((story) => (
                                <div key={story.id} className="bg-white rounded-xl shadow hover:shadow-md transition">
                                    <img
                                        src={story.cover}
                                        alt={story.title}
                                        className="w-full h-48 object-cover rounded-t-xl"
                                    />
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold text-gray-800 mb-1">{story.title}</h2>
                                        <p className="text-sm text-gray-500 mb-3">{story.status}</p>
                                        <div className="flex justify-between items-center space-x-2">
                                            <Link href={`/story/edit/${story.id}`}>
                                                <Button size="small">Sửa</Button>
                                            </Link>
                                            <Link href={`/story/${story.id}/manage`}>
                                                <Button size="small" type="dashed">Chương</Button>
                                            </Link>
                                            <Button size="small" danger>Xóa</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
