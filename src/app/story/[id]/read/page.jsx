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
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [story, setStory] = useState(null)
  const [selectedChapterId, setSelectedChapterId] = useState(null)
  const [chapterContent, setChapterContent] = useState('')
  const [chapterAudio, setChapterAudio] = useState('')
  const [isAtBottom, setIsAtBottom] = useState(false)

  const [ads, setAds] = useState([])
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
  }, [id, searchParams])

  useEffect(() => {
    const fetchChapter = async () => {
      if (!selectedChapterId) return
      try {
        const res = await API.Chapter.detail(selectedChapterId)
        if (res?.status === 200) {
          setChapterContent(sanitizeText(res.data?.content || ''))
          setChapterAudio(res?.data?.audio ?? '')

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

    fetchChapter()
  }, [selectedChapterId])

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

    // setUnlockedChapters((prev) => {
    //   const updated = [...prev, chapterId]
    //   localStorage.setItem('unlockedChapters', JSON.stringify(updated))
    //   return updated
    // })
    const allChapterIds = story?.chapters || []

    // Unlock all chapters
    localStorage.setItem('unlockedChapters', JSON.stringify(allChapterIds))
    setUnlockedChapters(allChapterIds)

    setTimeout(() => {
      handleChangeChapter(chapterId)
    }, 500)
  }

  const ChapterNavigator = ({ position = 'top' }) => {
    const index = story?.chapters?.findIndex((cid) => cid === selectedChapterId)
    const [inputChapter, setInputChapter] = useState(index + 1)

    useEffect(() => {
      setInputChapter(index + 1)
    }, [index])

    const handleJump = () => {
      const chapterNum = Number(inputChapter)
      if (!isNaN(chapterNum) && chapterNum >= 1 && chapterNum <= story.chapters.length) {
        const targetId = story.chapters[chapterNum - 1]
        handleChangeChapter(targetId)
      }
    }

    const renderButton = (label, chapterIndexOffset) => {
      const targetIndex = index + chapterIndexOffset
      if (targetIndex < 0 || targetIndex >= story.chapters.length) return null

      const targetId = story.chapters[targetIndex]
      const isUnlocked = unlockedChapters.includes(targetId)

      if (isUnlocked || unlockedChapters.length < 2) {
        return (
          <Button onClick={() => handleChangeChapter(targetId)}>
            {label}
          </Button>
        )
      }

      return (
        <Button type="dashed" danger onClick={() => unlockAndChangeChapter(targetId)}>
          👉 Click để hiển thị {label.toLowerCase()}
        </Button>
      )
    }

    return (
      <div className={`flex flex-wrap items-center gap-4 justify-between bg-gray-100 p-4 rounded ${position === 'bottom' ? 'mt-8' : 'mb-4'}`}>
        {renderButton('◀ Chương trước', -1)}
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
        {renderButton('Chương sau ▶', 1)}
      </div>
    )
  }

  if (!story || !selectedChapterId) {
    return <div className="text-center py-20 text-gray-600">Đang tải truyện...</div>
  }

  const currentIndex = story.chapters.findIndex((cid) => cid === selectedChapterId)

  return (
    <div>
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg relative">

          {/* Nút cuộn cố định */}
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

          {/* Tiêu đề + dropdown chọn chương */}
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

          {/* Audio nếu có */}
          {chapterAudio && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">🎧 Nghe Audio</h3>
              <audio controls className="w-full">
                <source src={chapterAudio} type="audio/mpeg" />
                Trình duyệt không hỗ trợ audio.
              </audio>
            </div>
          )}

          {/* Nội dung chương */}
          <div className="mt-6 border-t pt-6">
            <ChapterNavigator position="top" />
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {`Chương ${currentIndex + 1}`}
            </h2>
            <div
              className="text-gray-800 whitespace-pre-line leading-relaxed mb-6 select-none"
              ref={contentRef}
            >
              {chapterContent || 'Đang tải nội dung...'}
            </div>
            <ChapterNavigator position="bottom" />
          </div>
        </div>
      </div>
    </div>
  )
}
