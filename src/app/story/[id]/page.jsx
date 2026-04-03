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
    return fallbackMetadata({
      title: 'Không tìm thấy truyện',
      description: 'Truyện bạn tìm không tồn tại hoặc đã bị xóa.',
      path: `/story/${id}`,
    })
  }

  const desc = s.description?.slice(0, 150) || ''

  return {
    title: s.title,
    description: desc,
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/story/${s.slug || id}`,
      title: s.title,
      description: desc,
      siteName: 'ocuadua.com',
      images: [
        {
          url: ogImage,
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
  const story = await fetchStorySafe(id)
  return <StoryInfoPage story={story} />
}
