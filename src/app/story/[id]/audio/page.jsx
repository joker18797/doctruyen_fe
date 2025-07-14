'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import API from '@/Service/API'
import LayoutHeader from '@/components/LayoutHeader'
import { Button } from 'antd'

export default function StoryAudioPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const chapterId = searchParams.get('chapter')
  const [story, setStory] = useState(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [unlockedChapters, setUnlockedChapters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unlockedChapters')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [ads, setAds] = useState([])

  // 🔁 Load truyện + chapter hiện tại
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.Story.detail(id)
        if (res.status === 200) {
          const storyData = res.data
          setStory(storyData)

          const index = storyData.chapters.findIndex((cid) => cid === chapterId)
          setCurrentIndex(index)

          // Load audio chapter hiện tại
          const chapterRes = await API.Chapter.detail(chapterId)
          setAudioUrl(chapterRes.data?.audio || '')

          // Mở quảng cáo
          const adRes = await API.AdminAds.list()
          const activeAds = adRes.data?.filter((a) => a.active) || []
          setAds(activeAds)
          if (activeAds.length > 0) {
            const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)]
            window.open(randomAd.url, '_blank')
          }

          // Unlock nếu chưa unlock
          if (!unlockedChapters.includes(chapterId)) {
            const updated = [...unlockedChapters, chapterId]
            setUnlockedChapters(updated)
            localStorage.setItem('unlockedChapters', JSON.stringify(updated))
          }
        }
      } catch (err) {
        console.error('Lỗi tải truyện/audio:', err)
      }
    }

    if (id && chapterId) fetchData()
  }, [id, chapterId])

  const handleChangeChapter = (offset) => {
    if (!story) return
    const nextIndex = currentIndex + offset
    if (nextIndex < 0 || nextIndex >= story.chapters.length) return

    const nextId = story.chapters[nextIndex]
    const isUnlocked = unlockedChapters.includes(nextId)

    if (!isUnlocked) {
      if (ads.length > 0) {
        const randomAd = ads[Math.floor(Math.random() * ads.length)]
        window.open(randomAd.url, '_blank')
      }
      // Mở khóa toàn bộ
      localStorage.setItem('unlockedChapters', JSON.stringify(story.chapters))
      setUnlockedChapters(story.chapters)
    }

    router.push(`/story/${id}/audio?chapter=${nextId}`)
  }

  return (
    <div>
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="bg-white max-w-2xl w-full p-6 rounded-xl shadow-lg text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">
            🎧 {story?.title} - Chương {currentIndex + 1}
          </h1>

          {audioUrl ? (
            <audio controls className="w-full" autoPlay key={chapterId}>
              <source src={audioUrl} type="audio/mpeg" />
              Trình duyệt không hỗ trợ audio.
            </audio>
          ) : (
            <div className="text-gray-500">Đang tải audio...</div>
          )}

          <div className="flex justify-between">
            <Button
              disabled={currentIndex <= 0}
              onClick={() => handleChangeChapter(-1)}
            >
              ◀ Chương trước
            </Button>
            <Button
              disabled={currentIndex >= story?.chapters.length - 1}
              onClick={() => handleChangeChapter(1)}
            >
              Chương sau ▶
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
