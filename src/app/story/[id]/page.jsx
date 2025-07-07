'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Select, Input, List, Popconfirm } from 'antd'
import LayoutHeader from '@/components/LayoutHeader'
import { useSelector } from 'react-redux'
import { UserOutlined, DeleteOutlined } from '@ant-design/icons'
import { Avatar } from 'antd'
import API from '@/Service/API'
import { toast } from 'react-toastify'

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
        if (selectedChapterId !== null) {
            router.push(`/story/${id}/read?chapter=${selectedChapterId}`)
        } else {
            router.push(`/story/${id}/read`)
        }
    }

    const handleCommentSubmit = async () => {
        if (!commentInput.trim()) {
            toast.warning('Vui lòng nhập nội dung bình luận.')
            return
        }

        try {
            const res = await API.Comment.create(id, {
                content: commentInput.trim(),
            })

            if (res?.status === 201) {
                setCommentInput('')
                setComments([res.data.data, ...comments])
                toast.success('Đã gửi bình luận!')
            }
        } catch (err) {
            console.error('Lỗi khi gửi bình luận:', err)
            toast.error('Không thể gửi bình luận.')
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            const res = await API.Comment.delete(commentId)
            if (res.status === 200) {
                setComments((prev) => prev.filter((c) => c._id !== commentId))
                toast.success('Đã xóa bình luận')
            }
        } catch (err) {
            toast.error('Không thể xóa bình luận')
            console.error(err)
        }
    }

    const isOwnerOrAdmin = (commentUserId) => {
        return user && (user._id === commentUserId || user.role === 'admin')
    }

    if (!story) return <div className="text-center py-20 text-gray-600">Đang tải truyện...</div>

    return (
        <div>
            <LayoutHeader />
            <div className="min-h-screen bg-gray-50 py-10 px-4">
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <img
                            src={story.coverImage}
                            alt="Bìa truyện"
                            className="w-full md:w-60 h-64 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h1>
                            <p className="text-gray-600 mb-4">{story.description}</p>
                            {story.genres?.length > 0 && (
                                <p className="text-sm text-gray-700 mb-4">
                                    <span className="font-medium text-gray-800">Thể loại:</span>{' '}
                                    {story.genres.join(', ')}
                                </p>
                            )}
                            {story.isCompleted && (
                                <p className="text-sm text-green-600 font-medium mb-4">
                                    ✅ Truyện đã hoàn thành
                                </p>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                                <img
                                    src={story?.author?.avatar}
                                    alt="Avatar tác giả"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-sm text-gray-700 font-medium">{story.author?.name}</span>
                            </div>

                            <p className="text-gray-600 mb-4">Tổng số chương: {story.chapters?.length || 0}</p>

                            <div className="mb-4">
                                <Select
                                    showSearch
                                    placeholder="Chọn chương để đọc"
                                    value={selectedChapterId}
                                    onChange={(value) => setSelectedChapterId(value)}
                                    className="w-60"
                                    optionLabelProp="label"
                                >
                                    {story?.chapters?.map((chapterId, index) => (
                                        <Option
                                            key={chapterId}
                                            value={chapterId}
                                            label={`Chương ${index + 1}`}
                                        >
                                            Chương {index + 1}
                                        </Option>
                                    ))}
                                </Select>
                            </div>

                            <Button type="primary" onClick={handleRead}>
                                📖 Đọc truyện
                            </Button>
                        </div>
                    </div>

                    {/* Bình luận */}
                    {user && (
                        <div className="mt-10">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">💬 Bình luận</h2>
                            <TextArea
                                rows={3}
                                placeholder="Viết bình luận của bạn..."
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                            />
                            <div className="mt-2 text-right">
                                <Button type="primary" onClick={handleCommentSubmit}>
                                    Gửi bình luận
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <List
                            dataSource={comments}
                            locale={{ emptyText: 'Chưa có bình luận nào.' }}
                            renderItem={(item) => (
                                <List.Item
                                    actions={
                                        isOwnerOrAdmin(item.user?._id) ? [
                                            <Popconfirm
                                                title="Xoá bình luận này?"
                                                onConfirm={() => handleDeleteComment(item._id)}
                                                okText="Xoá"
                                                cancelText="Huỷ"
                                                key="delete"
                                            >
                                                <Button danger type="text" icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        ] : []
                                    }
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar
                                            src={item.user?.avatar ? item.user.avatar : undefined}
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