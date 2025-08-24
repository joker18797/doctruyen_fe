'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button, Select, Skeleton } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { sanitizeText } from '@/Helper/helpFunction'

const { Option } = Select
const chapterCache = new Map()

export default function StoryReadPage() {
  const contentRef = useRef(null)
  const fakeBottomRef = useRef(null)
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [story, setStory] = useState(null)
  const [selectedChapterId, setSelectedChapterId] = useState(null)
  const [chapterContent, setChapterContent] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterAudio, setChapterAudio] = useState('')
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [ads, setAds] = useState([])
  const [hasLockedChapters, setHasLockedChapters] = useState(false)

  const [unlockedChapters, setUnlockedChapters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unlockedChapters')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  // Load story + ads song song
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storyRes, adsRes] = await Promise.all([
          API.Story.detail(id),
          API.AdminAds.list()
        ])

        if (storyRes?.status === 200) {
          const s = storyRes.data
          setStory(s)
          const chapterParam = searchParams.get('chapter')
          setSelectedChapterId(chapterParam || s.chapters?.[0])
        }

        const activeAds = (adsRes?.data || []).filter((ad) => ad.active)
        setAds(activeAds)
      } catch (err) {
        console.error('Fetch data error:', err)
      }
    }
    if (id) fetchData()
  }, [id])

  // Load chapter nhanh với cache
  useEffect(() => {
    if (!selectedChapterId) return

    const loadChapter = async () => {
      if (chapterCache.has(selectedChapterId)) {
        const cached = chapterCache.get(selectedChapterId)
        setChapterContent(cached.content)
        setChapterTitle(cached.title)
        setChapterAudio(cached.audio)
        return
      }

      try {
        const res = await API.Chapter.detail(selectedChapterId)
        if (res?.status === 200) {
          const content = sanitizeText(res.data?.content || '')
          const title = res?.data?.title || ''
          const audio = res?.data?.audio ?? ''

          setChapterContent(content)
          setChapterTitle(title)
          setChapterAudio(audio)

          chapterCache.set(selectedChapterId, { content, title, audio })

          setUnlockedChapters((prev) => {
            if (!prev.includes(selectedChapterId)) {
              const updated = [...prev, selectedChapterId]
              localStorage.setItem('unlockedChapters', JSON.stringify(updated))
              return updated
            }
            return prev
          })
        }
      } catch (err) {
        console.error('Lỗi tải chương:', err)
      }
    }

    loadChapter()
  }, [selectedChapterId])

  // Theo dõi scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      setIsAtBottom(scrollY + windowHeight >= documentHeight - 100)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Kiểm tra chương nào khóa
  useEffect(() => {
    if (story?.chapters) {
      const locked = story.chapters.some((cid) => !unlockedChapters.includes(cid))
      setHasLockedChapters(locked)
    }
  }, [story, unlockedChapters])

  const handleChangeChapter = (chapterId) => {
    setSelectedChapterId(chapterId)
    router.replace(`/story/${id}/read?chapter=${chapterId}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const unlockAndChangeChapter = (chapterId) => {
    if (ads.length > 0) {
      const randomAd = ads[Math.floor(Math.random() * ads.length)]
      window.open(randomAd.url, '_blank')
    }
    const allChapterIds = story?.chapters || []
    localStorage.setItem('unlockedChapters', JSON.stringify(allChapterIds))
    setUnlockedChapters(allChapterIds)
    setTimeout(() => handleChangeChapter(chapterId), 300)
  }

  // 👉 Giữ nguyên ChapterNavigator
  const ChapterNavigator = ({ position = 'top', floating = false }) => {
    const index = story?.chapters?.findIndex((cid) => cid === selectedChapterId)

    const renderButton = (label, offset) => {
      const targetIndex = index + offset
      if (targetIndex < 0 || targetIndex >= story.chapters.length) return null
      const targetId = story.chapters[targetIndex]
      const isUnlocked = unlockedChapters.includes(targetId)

      if (isUnlocked || unlockedChapters.length < 2) {
        return <Button onClick={() => handleChangeChapter(targetId)}>{label}</Button>
      }
      return (
        <Button type="dashed" danger onClick={() => unlockAndChangeChapter(targetId)}>
          👉 Click để hiển thị
        </Button>
      )
    }

    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 bg-gray-100 px-3 py-2 sm:px-4 sm:py-4 rounded text-xl
        ${position === 'bottom' ? 'mt-8' : 'mb-4'}
        ${floating ? 'fixed bottom-0 left-0 right-0 z-30 border-t shadow-md' : ''}`}
      >
        <div className="flex-1 flex justify-start">
          {renderButton(<>◀ <span className="hidden sm:inline ml-1">Chương trước</span></>, -1)}
        </div>

        <div className="flex items-center gap-2 justify-center">
          <span className="hidden sm:inline">Chuyển tới chương:</span>
          <Select
            value={selectedChapterId}
            onChange={handleChangeChapter}
            className="min-w-[150px]"
            size="large"
            showSearch
            optionLabelProp="label"
          >
            {story.chapters.map((chapterId, idx) => (
              <Option key={chapterId} value={chapterId} label={`Chương ${idx + 1}`}>
                Chương {idx + 1}
              </Option>
            ))}
          </Select>
        </div>

        <div className="flex-1 flex justify-end">
          {renderButton(<><span className="hidden sm:inline mr-1">Chương sau</span> ▶</>, 1)}
        </div>
      </div>
    )
  }

  if (!story || !selectedChapterId) {
    return (
      <div className="pb-[90px]">
        <LayoutHeader />
        <div className="max-w-3xl mx-auto mt-10 p-4">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    )
  }

  const currentIndex = story.chapters.findIndex((cid) => cid === selectedChapterId)

  return (
    <div className="pb-[90px]">
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg relative">
          {/* Scroll lên/xuống */}
          <div className="fixed bottom-20 right-6 z-40">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={isAtBottom ? <UpOutlined /> : <DownOutlined />}
              onClick={() => {
                if (isAtBottom) {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                  fakeBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            />
          </div>

          {/* Tiêu đề */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h1>
          </div>

          {/* Audio */}
          {chapterAudio && (
            <div className="mb-6">
              <Button
                type="primary"
                onClick={() => {
                  if (ads.length > 0) {
                    const randomAd = ads[Math.floor(Math.random() * ads.length)]
                    window.open(randomAd.url, '_blank')
                  }
                  router.push(`/story/${id}/audio?chapter=${selectedChapterId}`)
                }}
              >
                ▶ Nghe chương {currentIndex + 1}
              </Button>
            </div>
          )}

          {/* Nội dung */}
          <div className="mt-6 border-t pt-6">
            <ChapterNavigator position="top" />
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {`Chương ${currentIndex + 1}: ${chapterTitle}`}
            </h2>
            {chapterContent ? (
              <div
                className="text-gray-800 whitespace-pre-line leading-loose mb-6 select-none text-[20px]"
                ref={contentRef}
              >
                {chapterContent}
              </div>
            ) : (
              <Skeleton active paragraph={{ rows: 12 }} />
            )}
          </div>
        </div>

        {hasLockedChapters && (
          <div className="max-w-4xl mx-auto mt-6 bg-[#FFEBCB] border border-yellow-300 rounded-xl p-6 shadow text-center">
            <p className="text-base text-gray-700">
              Mời đọc giả click <strong>"👉 Click để hiển thị"</strong> để mở khóa chương tiếp theo.
            </p>
          </div>
        )}
      </div>

      <div ref={fakeBottomRef} className="h-4" />
      <ChapterNavigator position="bottom" floating />
    </div>
  )
}
