'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Select, Input, List, message } from 'antd'
import LayoutHeader from '@/components/LayoutHeader'
import { useSelector } from 'react-redux'
import { UserOutlined } from '@ant-design/icons'
import { Avatar } from 'antd'

const { Option } = Select
const { TextArea } = Input

export default function StoryInfoPage() {
    const { id } = useParams()
    const router = useRouter()
    const [story, setStory] = useState(null)
    const [selectedChapterIndex, setSelectedChapterIndex] = useState(null)

    const user = useSelector((state) => state.user.currentUser)
    const [commentInput, setCommentInput] = useState('')
    const [comments, setComments] = useState([
        {
            user: { name: 'Khách ẩn danh' },
            content: 'Truyện này rất hay!',
            createdAt: '2025-06-29 10:00'
        }
    ])

    const fakeData = {
        1: {
            title: 'Truyện Kiếm Hiệp',
            cover: '/cover1.jpg',
            description: 'Một câu chuyện phiêu lưu ly kỳ đầy bí ẩn tại giang hồ.',
            chapters: Array.from({ length: 100 }, (_, i) => `Chương ${i + 1}: Nội dung chương ${i + 1}`),
            audio: '/audio-sample.mp3',
        },
    }

    useEffect(() => {
        if (id && fakeData[id]) {
            setStory(fakeData[id])
        }
    }, [id])

    const handleRead = () => {
        if (selectedChapterIndex !== null) {
            router.push(`/story/${id}/read?chapter=${selectedChapterIndex}`)
        } else {
            router.push(`/story/${id}/read`)
        }
    }

    const handleCommentSubmit = () => {
        if (!commentInput.trim()) {
            message.warning('Vui lòng nhập nội dung bình luận.')
            return
        }

        const newComment = {
            content: commentInput.trim(),
            createdAt: new Date().toLocaleString(),
            user: {
                name: user?.name || 'Ẩn danh'
            }
        }

        setComments([newComment, ...comments])
        setCommentInput('')
        message.success('Đã gửi bình luận!')
    }


    if (!story) return <div className="text-center py-20 text-gray-600">Đang tải truyện...</div>

    return (
        <div>
            <LayoutHeader />
            <div className="min-h-screen bg-gray-50 py-10 px-4">
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <img
                            src={story.cover}
                            alt="Bìa truyện"
                            className="w-full md:w-60 h-64 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h1>
                            <p className="text-gray-600 mb-4">{story.description}</p>
                            <p className="text-gray-600 mb-4">Tổng số chương: {story.chapters.length}</p>

                            <div className="mb-4">
                                <Select
                                    showSearch
                                    placeholder="Chọn chương để đọc"
                                    value={selectedChapterIndex}
                                    onChange={(value) => setSelectedChapterIndex(value)}
                                    className="w-60"
                                    optionLabelProp="label"
                                >
                                    {story.chapters.map((_, index) => (
                                        <Option
                                            key={index}
                                            value={index}
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
                                <List.Item>
                                    <div className="flex items-start gap-3">
                                        <Avatar icon={<UserOutlined />} />
                                        <div>
                                            <div className="font-semibold text-gray-800">{item.user.name}</div>
                                            <div className="text-gray-700">{item.content}</div>
                                            <div className="text-sm text-gray-500">{item.createdAt}</div>
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
