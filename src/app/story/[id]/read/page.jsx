'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button, Select, InputNumber } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { sanitizeText } from '@/Helper/helpFunction'

const { Option } = Select

export default function StoryReadPage() {
  const contentRef = useRef(null)
  const fakeBottomRef = useRef(null)
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [story, setStory] = useState(null)
  const [selectedChapterId, setSelectedChapterId] = useState(null)
  const [chapterContent, setChapterContent] = useState('')
  const [chapterTitle, setChapterTitle]= useState('');
  const [chapterAudio, setChapterAudio] = useState('')
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const [ads, setAds] = useState([])
  const [hasLockedChapters, setHasLockedChapters] = useState(false)

  const [unlockedChapters, setUnlockedChapters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unlockedChapters')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await API.AdminAds.list()
        const activeAds = (res.data || []).filter((ad) => ad.active)
        setAds(activeAds)
      } catch (err) {
        console.error('Không thể lấy ads:', err)
      }
    }
    fetchAds()
  }, [])

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await API.Story.detail(id)
        if (res?.status === 200) {
          setStory(res.data)
          const chapterParam = searchParams.get('chapter')
          if (chapterParam) {
            setSelectedChapterId(chapterParam)
          } else if (res.data.chapters?.length > 0) {
            setSelectedChapterId(res.data.chapters[0])
          }
        }
      } catch (err) {
        console.error('Lỗi tải truyện:', err)
      }
    }

    if (id) fetchStory()
  }, [id])

  useEffect(() => {
    const fetchChapter = async () => {
      if (!selectedChapterId) return
      try {
        const res = await API.Chapter.detail(selectedChapterId)
        if (res?.status === 200) {
          setChapterContent(sanitizeText(res.data?.content || ''))
          setChapterTitle(res?.data?.title || '')
          setChapterAudio(res?.data?.audio ?? '')

          // 🔓 Lưu chương đã mở
          setUnlockedChapters((prev) => {
            if (!prev.includes(selectedChapterId)) {
              const updated = [...prev, selectedChapterId]
              localStorage.setItem('unlockedChapters', JSON.stringify(updated))
              return updated
            }
            return prev
          })

          // 📢 Hiển thị quảng cáo nếu gần cuối
          const currentIndex = story?.chapters?.findIndex((cid) => cid === selectedChapterId)
          const isNearEnd = story && currentIndex === story.chapters.length - 2
          const hasShownAdKey = `hasShownAd_read_${id}_${selectedChapterId}`

          if (isNearEnd && ads.length > 0 && !localStorage.getItem(hasShownAdKey)) {
            const randomAd = ads[Math.floor(Math.random() * ads.length)]
            window.open(randomAd.url, '_blank')
            localStorage.setItem(hasShownAdKey, 'true')
          }
        }
      } catch (err) {
        console.error('Lỗi tải chương:', err)
      }
    }

    fetchChapter()
  }, [selectedChapterId, story, ads])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      setIsAtBottom(scrollY + windowHeight >= documentHeight - 100)
      setIsAtTop(scrollY <= 100)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const disable = (e) => e.preventDefault()
    document.addEventListener('contextmenu', disable)
    document.addEventListener('copy', disable)
    document.addEventListener('selectstart', disable)

    return () => {
      document.removeEventListener('contextmenu', disable)
      document.removeEventListener('copy', disable)
      document.removeEventListener('selectstart', disable)
    }
  }, [])

  // Cập nhật kiểm tra chương nào bị khóa
  useEffect(() => {
    if (story?.chapters) {
      const locked = story.chapters.some((cid) => !unlockedChapters.includes(cid))
      setHasLockedChapters(locked)
    }
  }, [story, unlockedChapters])

  const handleChangeChapter = (chapterId) => {
    setSelectedChapterId(chapterId)
    router.push(`/story/${id}/read?chapter=${chapterId}`)
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

    setTimeout(() => {
      handleChangeChapter(chapterId)
    }, 500)
  }

  const ChapterNavigator = ({ position = 'top', floating = false }) => {
    const index = story?.chapters?.findIndex((cid) => cid === selectedChapterId)
    const renderButton = (label, chapterIndexOffset) => {
      const targetIndex = index + chapterIndexOffset
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
          {renderButton(
            <>
              ◀ <span className="hidden sm:inline ml-1 text-lg">Chương trước</span>
            </>,
            -1
          )}
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
          {renderButton(
            <>
              <span className="hidden sm:inline mr-1 text-lg">Chương sau</span> ▶
            </>,
            1
          )}
        </div>
      </div>
    )
  }

  if (!story || !selectedChapterId) {
    return <div className="text-center py-20 text-gray-600">Đang tải truyện...</div>
  }

  const currentIndex = story.chapters.findIndex((cid) => cid === selectedChapterId)

  return (
    <div className="pb-[90px]">
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg relative">
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

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h1>
            <Select
              showSearch
              placeholder="Chọn chương"
              value={selectedChapterId}
              onChange={handleChangeChapter}
              className="w-60"
              optionLabelProp="label"
            >
              {story.chapters.map((chapterId, index) => (
                <Option key={chapterId} value={chapterId} label={`Chương ${index + 1}`}>
                  Chương {index + 1}
                </Option>
              ))}
            </Select>
          </div>

          {/* {chapterAudio && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">🎧 Nghe Audio</h3>
              <audio controls className="w-full" key={selectedChapterId}>
                <source src={chapterAudio} type="audio/mpeg" />
                Trình duyệt không hỗ trợ audio.
              </audio>
            </div>
          )} */}
          {chapterAudio && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">🎧 Nghe Audio</h3>
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
          <div className="mt-6 border-t pt-6">
            <ChapterNavigator position="top" />
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {`Chương ${currentIndex + 1}: ${chapterTitle}`}
            </h2>
            <div
              className="text-gray-800 whitespace-pre-line leading-loose mb-6 select-none text-[20px]"
              ref={contentRef}
            >
              {chapterContent || 'Đang tải nội dung...'}
            </div>
          </div>
        </div>

        {hasLockedChapters && (
          <div className="max-w-4xl mx-auto mt-6 bg-[#FFEBCB] border border-yellow-300 rounded-xl p-6 shadow text-center">
            <p className="text-base text-gray-700">
             Mời đọc giả click vào nút <strong>"👉 Click để hiển thị"</strong> để mở khóa chương tiếp theo và tiếp tục đọc truyện.
            </p>
            <p className="text-sm mt-2 text-gray-500 italic">(*) Bạn có thể được yêu cầu xem quảng cáo để mở khóa.</p>
          </div>
        )}
      </div>

      <div ref={fakeBottomRef} className="h-4" />
      <ChapterNavigator position="bottom" floating />
    </div>
  )
}
