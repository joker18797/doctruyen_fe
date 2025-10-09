"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Select, Input, List, Popconfirm, Avatar } from 'antd'
import LayoutHeader from '@/components/LayoutHeader'
import { useSelector } from 'react-redux'
import { UserOutlined, DeleteOutlined } from '@ant-design/icons'
import API from '@/Service/API'
import { toast } from 'react-toastify'

const { Option } = Select
const { TextArea } = Input

export default function StoryInfoPage({ story }) {
    const router = useRouter()
    const user = useSelector((state) => state.user.currentUser)

    const [selectedChapterId, setSelectedChapterId] = useState(story?.chapters?.[0] || null)
    const [commentInput, setCommentInput] = useState('')
    const [comments, setComments] = useState([])
    const [lockState, setLockState] = useState({ locked: false })
    const [ads, setAds] = useState([])
    const fetchData = async () => {
        try {
            const res = await API.AdminAds.list();
            if (res?.status === 200) {
                const activeAds = (res?.data || [])?.filter((ad) => ad.active)?.filter((ad) => ad.url?.toLowerCase().includes("shopee"))
                setAds(activeAds)
            }
        } catch (error) {

        }
    }
    useEffect(() => {
        fetchData()
    }, [])
    const unlockStory = () => {
        if (ads.length > 0) {
            const randomAd = ads[Math.floor(Math.random() * ads.length)]
            window.open(randomAd.url, "_blank")
        }
        localStorage.setItem(`unlockedYTStory_${story?._id}`, "true")
        setLockState({ locked: false })
    }
    // ✅ Chỉ fetch comments trên client
    useEffect(() => {
        if (story?._id) {
            fetchComments(story._id)
            const unlocked = localStorage.getItem(`unlockedYTStory_${story?._id}`)
            if (!unlocked) {
                setLockState({ locked: true })
            }
        }
    }, [story?._id])

    const fetchComments = async (id) => {
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
        router.push(`/story/${story._id}/read?chapter=${selectedChapterId}`)
    }

    const handleAudio = () => {
        router.push(`/story/${story._id}/audio?chapter=${selectedChapterId}`)
    }

    const handleCommentSubmit = async () => {
        if (!commentInput.trim()) return toast.warning('Vui lòng nhập nội dung bình luận.')
        try {
            const res = await API.Comment.create(story._id, { content: commentInput.trim() })
            if (res?.status === 201) {
                setCommentInput('')
                setComments([res.data.data, ...comments])
                toast.success('Đã gửi bình luận!')
            }
        } catch (err) {
            toast.error('Không thể gửi bình luận.')
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
        }
    }

    const isOwnerOrAdmin = (userId) => user && (user._id === userId || user.role === 'admin')

    if (!story) return <div className="text-center py-20 text-gray-600">Không tìm thấy truyện</div>

    return (
        <div>
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
                            {story?.authorName && story?.authorName !== 'undefined' &&
                                <p className="text-gray-600 mb-4">
                                    Tác giả: {story?.authorName ?? ''}
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
                                {story?.youtubeLink && !lockState.locked && (
                                    <Button
                                        type="dashed"
                                        style={{ borderColor: "#FF0000", color: "#FF0000" }}
                                        onClick={() => window.open(story.youtubeLink, "_blank", "noopener,noreferrer")}
                                    >
                                        ▶️ Xem trên YouTube
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    {lockState.locked && story?.youtubeLink &&
                        (
                            <div className='text-center mt-8'>
                                <p className="text-base font-bold mb-3">
                                    MỜI CÁC CẬU ẤN VÀO LINK HOẶC ẢNH BÊN DƯỚI <br />
                                    <span className="text-orange-600">MỞ ỨNG DỤNG SHOPEE</span> ĐỂ TIẾP TỤC NGHE TOÀN BỘ TRUYỆN
                                </p>

                                <div onClick={unlockStory} className="cursor-pointer">
                                    <div className="bg-[#00B2FF] rounded-xl shadow-lg overflow-hidden min-h-[600px] flex items-center justify-center">
                                        <div className="bg-white border-2 border-orange-400 rounded-xl mx-4 my-4 p-10 text-center relative w-full">
                                            <p className="text-lg font-semibold text-gray-700 mb-2">ẤN VÀO ĐÂY</p>
                                            <p className="text-2xl font-bold text-gray-900 mb-3">
                                                ĐỂ NGHE TOÀN BỘ CHƯƠNG TRUYỆN
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                HÀNH ĐỘNG NÀY CHỈ THỰC HIỆN MỘT LẦN. <br /> MONG CÁC CẬU ỦNG HỘ CHÚNG MÌNH NHA.
                                            </p>
                                            <div className="absolute bottom-3 right-3">
                                                <span className="text-4xl">👉</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
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