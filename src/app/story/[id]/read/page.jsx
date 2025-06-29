'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button, Select, InputNumber } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'

const { Option } = Select

export default function StoryReadPage() {
  const contentRef = useRef(null)
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [story, setStory] = useState(null)
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0)
  const [isAtBottom, setIsAtBottom] = useState(false)

  // Dữ liệu giả
  const fakeData = {
    1: {
      title: 'Truyện Kiếm Hiệp',
      cover: '/cover1.jpg',
      chapters: Array.from({ length: 100 }, (_, i) =>
        `Chương ${i + 1}: Nội dung chương rất dài...\n`.repeat(30)
      ),
      audio: '/audio-sample.mp3',
    },
  }

  // Lấy dữ liệu và chương hiện tại
  useEffect(() => {
    if (id && fakeData[id]) {
      setStory(fakeData[id])
      const chapterParam = searchParams.get('chapter')
      if (chapterParam && !isNaN(Number(chapterParam))) {
        setSelectedChapterIndex(Number(chapterParam))
      }
    }
  }, [id, searchParams])

  // Scroll detector để biết đang ở gần cuối trang
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      setIsAtBottom(scrollY + windowHeight + 200 >= documentHeight)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Chống copy & chuột phải
  useEffect(() => {
    const disableContext = (e) => e.preventDefault()
    const disableCopy = (e) => e.preventDefault()
    const disableSelect = (e) => e.preventDefault()

    document.addEventListener('contextmenu', disableContext)
    document.addEventListener('copy', disableCopy)
    document.addEventListener('selectstart', disableSelect)

    return () => {
      document.removeEventListener('contextmenu', disableContext)
      document.removeEventListener('copy', disableCopy)
      document.removeEventListener('selectstart', disableSelect)
    }
  }, [])

  // Đổi chương
  const handleChangeChapter = (value) => {
    if (value >= 0 && value < story.chapters.length) {
      setSelectedChapterIndex(value)
      router.push(`/story/${id}/read?chapter=${value}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const ChapterNavigator = ({ position = 'top' }) => {
    const [inputChapter, setInputChapter] = useState(selectedChapterIndex + 1)

    useEffect(() => {
      setInputChapter(selectedChapterIndex + 1)
    }, [selectedChapterIndex])

    const handleJump = () => {
      const chapterNum = Number(inputChapter)
      if (!isNaN(chapterNum) && chapterNum >= 1 && chapterNum <= story.chapters.length) {
        handleChangeChapter(chapterNum - 1)
      }
    }

    return (
      <div className={`flex flex-wrap items-center gap-4 justify-between bg-gray-100 p-4 rounded ${position === 'bottom' ? 'mt-8' : 'mb-4'}`}>
        <Button
          disabled={selectedChapterIndex === 0}
          onClick={() => handleChangeChapter(selectedChapterIndex - 1)}
        >
          ◀ Chương trước
        </Button>

        <div className="flex items-center gap-2">
          <span>Chuyển tới chương:</span>
          <InputNumber
            min={1}
            max={story.chapters.length}
            value={inputChapter}
            onChange={(val) => setInputChapter(val)}
          />
          <Button type="primary" onClick={handleJump}>
            Chuyển chương
          </Button>
        </div>

        <Button
          disabled={selectedChapterIndex === story.chapters.length - 1}
          onClick={() => handleChangeChapter(selectedChapterIndex + 1)}
        >
          Chương sau ▶
        </Button>
      </div>
    )
  }

  if (!story) return <div className="text-center py-20 text-gray-600">Đang tải truyện...</div>

  return (
    <div>
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg relative">

          {/* Nút cuộn lên/xuống cố định */}
          <div className="fixed bottom-6 right-6 z-40">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={isAtBottom ? <UpOutlined /> : <DownOutlined />}
              onClick={() => {
                if (isAtBottom) {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                  contentRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            />
          </div>

          {/* Tiêu đề & chọn chương */}
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

          {/* Audio nếu có */}
          {story.audio && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">🎧 Nghe Audio</h3>
              <audio controls className="w-full">
                <source src={story.audio} type="audio/mpeg" />
                Trình duyệt không hỗ trợ audio.
              </audio>
            </div>
          )}

          {/* Nội dung chương */}
          {selectedChapterIndex !== null && (
            <div className="mt-6 border-t pt-6">
              <ChapterNavigator position="top" />
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {`Chương ${selectedChapterIndex + 1}`}
              </h2>
              <div
                className="text-gray-800 whitespace-pre-line leading-relaxed mb-6 select-none"
                ref={contentRef}
              >
                {story.chapters[selectedChapterIndex]}
              </div>
              <ChapterNavigator position="bottom" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
