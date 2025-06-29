'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button, Select } from 'antd'
import LayoutHeader from '@/components/LayoutHeader'

const { Option } = Select

export default function StoryReadPage() {
    const { id } = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [story, setStory] = useState(null)
    const [selectedChapterIndex, setSelectedChapterIndex] = useState(null)

    const fakeData = {
        1: {
            title: 'Truyện Kiếm Hiệp',
            cover: '/cover1.jpg',
            chapters: Array.from({ length: 100 }, (_, i) => `Chương ${i + 1}: Nội dung chương ${i + 1}`),
            audio: '/audio-sample.mp3',
        },
    }

    useEffect(() => {
        if (id && fakeData[id]) {
            setStory(fakeData[id])

            const chapterParam = searchParams.get('chapter')
            if (chapterParam && !isNaN(Number(chapterParam))) {
                setSelectedChapterIndex(Number(chapterParam))
            }
        }
    }, [id, searchParams])

    const handleChangeChapter = (value) => {
        setSelectedChapterIndex(value)
        router.push(`/story/${id}/read?chapter=${value}`)
    }

    if (!story) return <div className="text-center py-20 text-gray-600">Đang tải truyện...</div>

    return (
        <div> 
            <LayoutHeader />
            <div className="min-h-screen bg-gray-50 py-10 px-4">

                <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h1>
                        <Select
                            showSearch
                            placeholder="Chọn chương"
                            value={selectedChapterIndex}
                            onChange={handleChangeChapter}
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

                    {/* Nội dung chương */}
                    {selectedChapterIndex !== null && (
                        <div className="mt-6 border-t pt-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                {`Chương ${selectedChapterIndex + 1}`}
                            </h2>
                            <div className="text-gray-800 whitespace-pre-line leading-relaxed mb-6">
                                {story.chapters[selectedChapterIndex]}
                            </div>

                            {story.audio && (
                                <div className="mb-6">
                                    <h3 className="text-md font-semibold mb-2">🎧 Nghe Audio</h3>
                                    <audio controls className="w-full">
                                        <source src={story.audio} type="audio/mpeg" />
                                        Trình duyệt không hỗ trợ audio.
                                    </audio>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
