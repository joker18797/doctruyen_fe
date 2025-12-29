'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button, Select, Skeleton, Switch } from 'antd'
import { DownOutlined, UpOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { sanitizeText } from '@/Helper/helpFunction'

const { Option } = Select
const chapterCache = new Map()

// Helper function để phát hiện Facebook in-app browser
const isFacebookApp = () => {
  if (typeof window === 'undefined') return false
  const userAgent = window.navigator.userAgent.toLowerCase()
  return (
    userAgent.includes('fban') || 
    userAgent.includes('fbav') || 
    userAgent.includes('fbsn')
  )
}

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
  const [adsOther, setAdsOther] = useState([])
  const [lockedChapterId, setLockedChapterId] = useState(null)

  const [unlockedChapters, setUnlockedChapters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unlockedChapters')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [lockState, setLockState] = useState({ locked: false })
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      return saved === 'true'
    }
    return false
  })

  // Áp dụng dark mode class vào document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', isDarkMode.toString())
  }, [isDarkMode])

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      try {
        const [storyRes, adsRes] = await Promise.all([
          API.Story.detail(id),
          API.AdminAds.list()
        ])

        if (!isMounted) return

        if (storyRes?.status === 200) {
          const s = storyRes.data
          setStory(s)
          const chapterParam = searchParams.get('chapter')
          setSelectedChapterId(chapterParam || s.chapters?.[0])
        }

        const activeAds = (adsRes?.data || []).filter((ad) => ad.active)?.filter((ad) => ad.url?.toLowerCase().includes("shopee"))
        const activeAdsOther = (adsRes?.data || []).filter((ad) => ad.active)?.filter((ad) => !ad.url?.toLowerCase().includes("shopee"))
        setAds(activeAds)
        setAdsOther(activeAdsOther)
      } catch (err) {
        console.error('Fetch data error:', err)
        // Đảm bảo không để màn hình trắng khi có lỗi
        if (isMounted && !story) {
          setStory({ chapters: [] })
        }
      }
    }
    if (id) fetchData()
    
    return () => {
      isMounted = false
    }
  }, [id, searchParams])


  // Load chapter nhanh với cache
  useEffect(() => {
    if (!selectedChapterId) return

    let isMounted = true

    const loadChapter = async () => {
      if (chapterCache.has(selectedChapterId)) {
        const cached = chapterCache.get(selectedChapterId)
        if (isMounted) {
          setChapterContent(cached.content)
          setChapterTitle(cached.title)
          setChapterAudio(cached.audio)
        }
        return
      }

      try {
        if (isMounted) setIsPrefetching(true)
        const res = await API.Chapter.detail(selectedChapterId)
        
        if (!isMounted) return
        
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
        if (isMounted) {
          setIsPrefetching(false)
          console.error('Lỗi tải chương:', err)
        }
      }
    }

    loadChapter()
    
    return () => {
      isMounted = false
    }
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
    
    // Throttle scroll event để tối ưu performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', throttledScroll, { passive: true })
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [])

  // Xử lý khi tab được focus lại (quan trọng cho Facebook app)
  useEffect(() => {
    const restoreContent = () => {
      // Khi tab được focus lại, đảm bảo state được cập nhật
      if (story && selectedChapterId) {
        // Trong Facebook app, restore từ sessionStorage nếu có
        if (isFacebookApp()) {
          const savedState = sessionStorage.getItem(`fb_state_${id}`)
          if (savedState) {
            try {
              const state = JSON.parse(savedState)
              // Chỉ restore nếu state còn hợp lệ (không quá 5 phút)
              if (state.storyId === id && Date.now() - state.timestamp < 300000) {
                if (!chapterContent && state.chapterContent) {
                  setChapterContent(state.chapterContent)
                  setChapterTitle(state.chapterTitle)
                  setChapterAudio(state.chapterAudio)
                }
                // Xóa saved state sau khi restore
                sessionStorage.removeItem(`fb_state_${id}`)
              }
            } catch (e) {
              console.error('Lỗi restore state:', e)
            }
          }
        }
        
        // Nếu content bị mất, restore từ cache
        if (!chapterContent) {
          const cached = chapterCache.get(selectedChapterId)
          if (cached) {
            setChapterContent(cached.content)
            setChapterTitle(cached.title)
            setChapterAudio(cached.audio)
          } else {
            // Nếu không có cache, reload chapter
            const loadChapter = async () => {
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
                }
              } catch (err) {
                console.error('Lỗi reload chapter:', err)
              }
            }
            loadChapter()
          }
        }
        
        // Đảm bảo lockState đúng
        const unlocked = localStorage.getItem(`unlockedStory_${id}`)
        if (unlocked && lockState.locked) {
          setLockState({ locked: false })
        }
        
        // Đảm bảo story không bị null
        if (!story) {
          const loadStory = async () => {
            try {
              const res = await API.Story.detail(id)
              if (res?.status === 200) {
                setStory(res.data)
              }
            } catch (err) {
              console.error('Lỗi reload story:', err)
            }
          }
          loadStory()
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Delay một chút để đảm bảo Facebook app đã hoàn tất việc restore
        setTimeout(() => {
          restoreContent()
        }, 200)
      }
    }

    const handleFocus = () => {
      setTimeout(() => {
        restoreContent()
      }, 200)
    }

    const handlePageshow = (e) => {
      // Xử lý khi trang được restore từ back/forward cache
      if (e.persisted) {
        restoreContent()
      }
    }

    // Restore ngay khi component mount (quan trọng cho Facebook app)
    if (isFacebookApp()) {
      setTimeout(() => {
        restoreContent()
      }, 100)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('pageshow', handlePageshow)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('pageshow', handlePageshow)
    }
  }, [story, selectedChapterId, chapterContent, id, lockState])

  // Helper function để mở link an toàn
  const openLinkSafely = (url, adId) => {
    // Track click (chạy ngầm, không block)
    if (adId) {
      API.AdminAds.trackClick(adId).catch(err => console.error('Lỗi track click:', err))
    }
    
    // Trong Facebook app, lưu state trước khi mở link để tránh mất dữ liệu
    if (isFacebookApp()) {
      // Lưu state hiện tại vào sessionStorage để restore sau
      const stateToSave = {
        storyId: id,
        chapterId: selectedChapterId,
        chapterContent,
        chapterTitle,
        chapterAudio,
        timestamp: Date.now()
      }
      sessionStorage.setItem(`fb_state_${id}`, JSON.stringify(stateToSave))
      
      // Trong Facebook app, dùng location.href để mở trong cùng tab
      // hoặc window.open nhưng với fallback
      try {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        // Nếu popup bị chặn, fallback sang location.href
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = url
        }
      } catch (e) {
        window.location.href = url
      }
    } else {
      // Trong trình duyệt thông thường, mở tab mới
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }


  const handleChangeChapter = (chapterId) => {
    const unlocked = localStorage.getItem(`unlockedStory_${id}`)
    if (!unlocked) {
      setLockState({ locked: true })
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const isLastChapter = story?.chapters?.[story.chapters.length - 1] === chapterId
    if (isLastChapter && adsOther.length > 0) {
      const randomAd = adsOther[Math.floor(Math.random() * adsOther.length)]
      openLinkSafely(randomAd.url, randomAd._id)
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
    if (ads.length === 0) return

    const randomAd = ads[Math.floor(Math.random() * ads.length)]
    
    // Mở tab mới với link quảng cáo
    openLinkSafely(randomAd.url, randomAd._id)
    
    // Unlock ngay
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
        className={`flex flex-wrap items-center justify-between gap-3 bg-gray-100 dark:bg-gray-800 px-3 py-2 sm:px-4 sm:py-4 rounded text-xl
        ${position === 'bottom' ? 'mt-8' : 'mb-4'}
        ${floating ? 'fixed bottom-0 left-0 right-0 z-30 border-t dark:border-gray-700 shadow-md' : ''}`}
      >
        <div className="flex-1 flex justify-start">
          {renderButton(<>◀ <span className="hidden sm:inline ml-1">Chương trước</span></>, -1)}
        </div>

        <div className="flex items-center gap-2 justify-center">
          <span className="hidden sm:inline text-gray-800 dark:text-gray-200">Chuyển tới chương:</span>
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
      <div className="pb-[90px] dark:bg-gray-900 min-h-screen">
        <LayoutHeader />
        <div className="max-w-3xl mx-auto mt-10 p-4">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    )
  }

  const currentIndex = story.chapters.findIndex((cid) => cid === selectedChapterId)

  return (
    <div className="pb-[90px] dark:bg-gray-900">
      <LayoutHeader />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg relative">
          {/* Dark mode toggle */}
          <div className="fixed top-20 right-6 z-40 flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md border dark:border-gray-700">
            <SunOutlined className={isDarkMode ? 'text-gray-400' : 'text-yellow-500'} />
            <Switch
              checked={isDarkMode}
              onChange={setIsDarkMode}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
            <MoonOutlined className={isDarkMode ? 'text-blue-400' : 'text-gray-400'} />
          </div>

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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{story.title}</h1>
          </div>

          {/* Audio */}
          {!lockState.locked && chapterAudio && (
            <div className="mb-6">
              <Button
                type="primary"
                onClick={() => {
                  if (ads.length > 0) {
                    const randomAd = ads[Math.floor(Math.random() * ads.length)]
                    openLinkSafely(randomAd.url, randomAd._id)
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
              <div className="mt-6 border-t dark:border-gray-700 pt-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {`Chương ${story.chapters.indexOf(selectedChapterId) + 1}: ${chapterTitle}`}
                </h2>
                {chapterContent ? (
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-loose mb-6 select-none text-[20px]">
                    {chapterContent}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Đang tải nội dung...</p>
                )}
              </div>
            ) : (
              <div className='text-center'>
                <p className="text-base font-bold mb-3 text-gray-800 dark:text-gray-200">
                  MỜI CÁC CẬU ẤN VÀO LINK HOẶC ẢNH BÊN DƯỚI <br />
                  <span className="text-orange-600 dark:text-orange-400">MỞ ỨNG DỤNG SHOPEE</span> ĐỂ TIẾP TỤC ĐỌC TOÀN BỘ TRUYỆN
                </p>

                <div onClick={unlockStory} className="cursor-pointer">
                  <div className="bg-[#00B2FF] dark:bg-[#0088cc] rounded-xl shadow-lg overflow-hidden min-h-[600px] flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-700 border-2 border-orange-400 dark:border-orange-500 rounded-xl mx-4 my-4 p-10 text-center relative w-full">
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">ẤN VÀO ĐÂY</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        ĐỂ ĐỌC TOÀN BỘ CHƯƠNG TRUYỆN
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
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


