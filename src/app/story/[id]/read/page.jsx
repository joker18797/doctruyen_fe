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
  const [isPrefetching, setIsPrefetching] = useState(false)
  const [ads, setAds] = useState([])
  const [lockedChapterId, setLockedChapterId] = useState(null)

  const [unlockedChapters, setUnlockedChapters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unlockedChapters')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [lockState, setLockState] = useState({ locked: false })

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

        const activeAds = (adsRes?.data || []).filter((ad) => ad.active)?.filter((ad) => ad.url?.toLowerCase().includes("shopee"))
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
        setIsPrefetching(true)
        const res = await API.Chapter.detail(selectedChapterId)
        if (res?.status === 200) {
          const content = sanitizeText(res.data?.content || '')
          const title = res?.data?.title || ''
          const audio = res?.data?.audio ?? ''
          setIsPrefetching(false)
          setChapterContent(content)
          setChapterTitle(title)
          setChapterAudio(audio)

          chapterCache.set(selectedChapterId, { content, title, audio })

          setUnlockedChapters((prev) => {
            if (!prev.includes(selectedChapterId)) {
              const updated = [...prev, selectedChapterId]
              return updated
            }
            return prev
          })
        }
      } catch (err) {
        setIsPrefetching(false)
        console.error('Lỗi tải chương:', err)
      }
    }

    loadChapter()
  }, [selectedChapterId])

  // Prefetch chương tiếp theo
  useEffect(() => {
    if (!story || !selectedChapterId) return

    const index = story.chapters.findIndex((cid) => cid === selectedChapterId)
    const nextId = story.chapters[index + 1]
    if (!nextId) return

    const timer = setTimeout(async () => {
      if (!chapterCache.has(nextId)) {
        try {
          const res = await API.Chapter.detail(nextId)
          if (res?.status === 200) {
            const content = sanitizeText(res.data?.content || '')
            const title = res?.data?.title || ''
            const audio = res?.data?.audio ?? ''

            chapterCache.set(nextId, { content, title, audio })
            console.log(`Prefetched chapter ${nextId}`)
          }
        } catch (err) {
          console.error('Prefetch error:', err)
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [story, selectedChapterId])

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

  const handleChangeChapter = (chapterId) => {
    const unlocked = localStorage.getItem(`unlockedStory_${id}`)
    if (!unlocked) {
      setLockState({ locked: true })
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    // Load chương
    setLockState({ locked: false })
    setChapterContent("") // TODO: fetch content API
    setChapterTitle("")   // TODO: fetch title
    setChapterAudio("")   // TODO: fetch audio
    setSelectedChapterId(chapterId)
    router.replace(`/story/${id}/read?chapter=${chapterId}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Hàm unlock truyện
  const unlockStory = () => {
    if (ads.length > 0) {
      const randomAd = ads[Math.floor(Math.random() * ads.length)]
      window.open(randomAd.url, "_blank")
    }

    // Lưu trạng thái unlock theo storyId
    localStorage.setItem(`unlockedStory_${id}`, "true")
    setLockState({ locked: false })
    if (story?.chapters?.length > 1) {
      const currentIdx = story.chapters.findIndex((cid) => cid === selectedChapterId)
      const nextChapterId = story.chapters[currentIdx + 1] || story.chapters[1]

      if (nextChapterId) {
        setTimeout(() => {
          handleChangeChapter(nextChapterId)
        }, 300)
      }
    }
  }

  // 👉 ChapterNavigator giữ nguyên
  const ChapterNavigator = ({ position = 'top', floating = false }) => {
    const index = story?.chapters?.findIndex((cid) => cid === selectedChapterId)

    const renderButton = (label, offset) => {
      const targetIndex = index + offset
      if (targetIndex < 0 || targetIndex >= story.chapters.length) return null
      const targetId = story.chapters[targetIndex]
      return (
        <Button onClick={() => handleChangeChapter(targetId)}>{label}</Button>
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
          {!lockState.locked && chapterAudio && (
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
          <div className="max-w-4xl mx-auto mt-6">
            {!lockState.locked ? (
              <div className="mt-6 border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {`Chương ${story.chapters.indexOf(selectedChapterId) + 1}: ${chapterTitle}`}
                </h2>
                {chapterContent ? (
                  <div className="text-gray-800 whitespace-pre-line leading-loose mb-6 select-none text-[20px]">
                    {chapterContent}
                  </div>
                ) : (
                  <p className="text-gray-500">Đang tải nội dung...</p>
                )}
              </div>
            ) : (
              <div className='text-center'>
                <p className="text-base font-bold mb-3">
                  MỜI CÁC CẬU ẤN VÀO LINK HOẶC ẢNH BÊN DƯỚI <br />
                  <span className="text-orange-600">MỞ ỨNG DỤNG SHOPEE</span> ĐỂ TIẾP TỤC ĐỌC TOÀN BỘ TRUYỆN
                </p>

                <div onClick={unlockStory} className="cursor-pointer">
                  <div className="bg-[#00B2FF] rounded-xl shadow-lg overflow-hidden min-h-[600px] flex items-center justify-center">
                    <div className="bg-white border-2 border-orange-400 rounded-xl mx-4 my-4 p-10 text-center relative w-full">
                      <p className="text-lg font-semibold text-gray-700 mb-2">ẤN VÀO ĐÂY</p>
                      <p className="text-2xl font-bold text-gray-900 mb-3">
                        ĐỂ ĐỌC TOÀN BỘ CHƯƠNG TRUYỆN
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
            )}
          </div>
        </div>

        <div ref={fakeBottomRef} className="h-4" />
        <ChapterNavigator position="bottom" floating />
      </div>
    </div>
  )
}
