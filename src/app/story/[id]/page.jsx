// app/story/[id]/page.js
import API from '@/Service/API'
import StoryInfoPage from '@/components/StoryInfoPage'

const SITE_URL = 'https://ocuadua.com'
const DEFAULT_OG_IMAGE =
  'https://cdn.jsdelivr.net/gh/joker18797/doctruyen_storage@main/uploads/1756106895153-z6768944788849_7bdce7562fe6f812db182c83bdc66ee0.jpg'

function toAbsoluteImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return DEFAULT_OG_IMAGE

  try {
    const normalized = new URL(imageUrl, SITE_URL).toString()
    if (!normalized.startsWith('http')) return DEFAULT_OG_IMAGE
    return normalized
  } catch {
    return DEFAULT_OG_IMAGE
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const story = await API.Story.detail(id)
  const s = story?.data

  if (!s) {
    return {
      title: 'Không tìm thấy truyện',
      description: 'Truyện bạn tìm không tồn tại hoặc đã bị xóa.',
    }
  }

  const ogImage = toAbsoluteImageUrl(s.coverImage)
  const desc =
    s.description?.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150) ?? ''

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
      images: [ogImage],
    },
    links: [{ rel: 'image_src', href: ogImage }],
  }
}

export default async function Page({ params }) {
  const { id } = await params
  const res = await API.Story.detail(id)
  const story = res?.data || null
  return <StoryInfoPage story={story} />
}
