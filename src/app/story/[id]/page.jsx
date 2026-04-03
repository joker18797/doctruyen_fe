import API from '@/Service/API'
import StoryInfoPage from '@/components/StoryInfoPage'

const API_BASE = process.env.NEXT_PUBLIC_URL_API

async function fetchStoryForMeta(id) {
  try {
    const res = await fetch(`${API_BASE}/api/story/${id}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const s = await fetchStoryForMeta(id)

  if (!s) {
    return {
      title: 'Không tìm thấy truyện',
      description: 'Truyện bạn tìm không tồn tại hoặc đã bị xóa.',
    }
  }

  const desc = s.description?.slice(0, 150) || ''

  return {
    title: s.title,
    description: desc,
    openGraph: {
      type: 'article',
      url: `https://ocuadua.com/story/${s.slug || id}`,
      title: s.title,
      description: desc,
      siteName: 'ocuadua.com',
      images: [
        {
          url: s.coverImage,
          width: 1200,
          height: 630,
          alt: s.title,
        },
      ],
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title: s.title,
      description: desc,
      images: [s.coverImage],
    },
  }
}

export default async function Page({ params }) {
  const { id } = await params
  const res = await API.Story.detail(id)
  const story = res?.data || null
  return <StoryInfoPage story={story} />
}
