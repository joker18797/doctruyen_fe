'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Select, Input, List, Popconfirm, Avatar } from 'antd'
import LayoutHeader from '@/components/LayoutHeader'
import { useSelector } from 'react-redux'
import { UserOutlined, DeleteOutlined } from '@ant-design/icons'
import API from '@/Service/API'
import { toast } from 'react-toastify'
import Head from 'next/head'

const { Option } = Select
const { TextArea } = Input

export default function StoryInfoPage() {
    const { id } = useParams()
    const router = useRouter()
    const user = useSelector((state) => state.user.currentUser)

    const [story, setStory] = useState(null)
    const [selectedChapterId, setSelectedChapterId] = useState(null)
    const [commentInput, setCommentInput] = useState('')
    const [comments, setComments] = useState([])

    useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera
    const isFacebookApp = ua.includes("FBAN") || ua.includes("FBAV")

    if (isFacebookApp) {
      // Chuyển sang Chrome hoặc trình duyệt mặc định
      const url = window.location.href

      // Cách 1: dùng intent:// (Android Chrome)
      if (/android/i.test(ua)) {
        window.location.href = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`
      } 
      // Cách 2: fallback cho iOS (mở Safari)
      else if (/iPad|iPhone|iPod/.test(ua)) {
        window.location.href = url
      }
    }
  }, [])
  
    useEffect(() => {
        if (id) {
            fetchStory()
            fetchComments()
        }
    }, [id])

    const fetchStory = async () => {
        try {
            const res = await API.Story.detail(id)
            setStory(res.data)
            setSelectedChapterId(res?.data?.chapters?.[0])
        } catch (err) {
            console.error('Lỗi khi lấy chi tiết truyện:', err)
        }
    }

    const fetchComments = async () => {
        try {
            const res = await API.Comment.list(id)
            if (res?.status === 200) {
                setComments(res.data.data)
            }
        } catch (err) {
            console.error('Lỗi khi lấy bình luận:', err)
        }
    }

    const handleRead = () => {
        const basePath = `/story/${id}`
        const chapterPath = selectedChapterId ? `?chapter=${selectedChapterId}` : ''
        router.push(`${basePath}/read${chapterPath}`)
    }

    const handleAudio = () => {
        const basePath = `/story/${id}`
        const chapterPath = selectedChapterId ? `?chapter=${selectedChapterId}` : ''
        router.push(`${basePath}/audio${chapterPath}`)
    }

    const handleCommentSubmit = async () => {
        if (!commentInput.trim()) {
            return toast.warning('Vui lòng nhập nội dung bình luận.')
        }
        try {
            const res = await API.Comment.create(id, { content: commentInput.trim() })
            if (res?.status === 201) {
                setCommentInput('')
                setComments([res.data.data, ...comments])
                toast.success('Đã gửi bình luận!')
            }
        } catch (err) {
            toast.error('Không thể gửi bình luận.')
            console.error(err)
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            const res = await API.Comment.delete(commentId)
            if (res.status === 200) {
                setComments(comments.filter((c) => c._id !== commentId))
                toast.success('Đã xóa bình luận')
            }
        } catch (err) {
            toast.error('Không thể xóa bình luận')
            console.error(err)
        }
    }

    const isOwnerOrAdmin = (userId) => user && (user._id === userId || user.role === 'admin')

    if (!story) return <div className="text-center py-20 text-gray-600">Đang tải truyện...</div>

    return (
        <div>
            <Head>
                <title>{story.title || 'Chi tiết truyện'}</title>
                <meta name="description" content={story.description?.slice(0, 150) || ''} />
                <meta property="og:title" content={story.title} />
                <meta property="og:description" content={story.description?.slice(0, 150)} />
                <meta property="og:image" content={story.coverImage} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={`https://yourdomain.com/story/${id}`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={story.title} />
                <meta name="twitter:description" content={story.description?.slice(0, 150)} />
                <meta name="twitter:image" content={story.coverImage} />
            </Head>

            <LayoutHeader />
            <div className="min-h-screen bg-gray-50 py-10 px-4">
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6">
                        <img
                            src={story.coverImage}
                            alt="Bìa truyện"
                            className="w-full md:w-60 h-64 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h1>
                            <p
                                className="text-gray-600 mb-4"
                                dangerouslySetInnerHTML={{
                                    __html: story.description?.replace(/\n/g, '<br />'),
                                }}
                            />

                            {story.genres?.length > 0 && (
                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>Thể loại:</strong> {story.genres.join(', ')}
                                </p>
                            )}

                            {story.isCompleted && (
                                <p className="text-sm text-green-600 font-medium mb-2">✅ Truyện đã hoàn thành</p>
                            )}

                            <div
                                className="flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80"
                                onClick={() => router.push(`/author/${story.author._id}`)}
                            >
                                <img
                                    src={story.author?.avatar}
                                    alt="Tác giả"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-sm font-medium text-gray-700">{story.author?.name}</span>
                            </div>

                            <p className="text-gray-600 mb-4">Tổng số chương: {story.chapters?.length || 0}</p>
                            <p className="text-gray-600 mb-4">
                                Lượt xem: {Number(story.totalRead).toLocaleString("en-US")}
                            </p>
                            {story?.authorName &&
                             <p className="text-gray-600 mb-4">
                                Tác giả: {story?.authorName}
                            </p>}
                            <Select
                                showSearch
                                placeholder="Chọn chương để đọc"
                                value={selectedChapterId}
                                onChange={setSelectedChapterId}
                                className="w-60 mb-4"
                            >
                                {story.chapters?.map((cid, index) => (
                                    <Option key={cid} value={cid}>
                                        Chương {index + 1}
                                    </Option>
                                ))}
                            </Select>

                            <div className="flex items-center gap-3">
                                <Button type="primary" onClick={handleRead}>📖 Đọc truyện</Button>
                                {story.hasAudio && (
                                    <Button type="default" onClick={handleAudio}>🎧 Nghe audio</Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {user && (
                        <div className="mt-10">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">💬 Bình luận</h2>
                            <TextArea
                                rows={3}
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder="Viết bình luận của bạn..."
                            />
                            <div className="mt-2 text-right">
                                <Button type="primary" onClick={handleCommentSubmit}>Gửi bình luận</Button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <List
                            dataSource={comments}
                            locale={{ emptyText: 'Chưa có bình luận nào.' }}
                            renderItem={(item) => (
                                <List.Item
                                    actions={isOwnerOrAdmin(item.user?._id) ? [
                                        <Popconfirm
                                            key="delete"
                                            title="Xoá bình luận này?"
                                            onConfirm={() => handleDeleteComment(item._id)}
                                            okText="Xoá"
                                            cancelText="Huỷ"
                                        >
                                            <Button danger type="text" icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    ] : []}
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar
                                            src={item.user?.avatar}
                                            icon={!item.user?.avatar && <UserOutlined />}
                                        />
                                        <div>
                                            <div className="font-semibold text-gray-800">{item.user?.name || 'Ẩn danh'}</div>
                                            <div className="text-gray-700">{item.content}</div>
                                            <div className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}