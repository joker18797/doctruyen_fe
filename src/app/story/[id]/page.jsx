import API from '@/Service/API'
import StoryInfoPage from '@/components/StoryInfoPage'

const SITE_URL = 'https://ocuadua.com'
const DEFAULT_OG_IMAGE =
  'https://cdn.jsdelivr.net/gh/joker18797/doctruyen_storage@main/uploads/1756106895153-z6768944788849_7bdce7562fe6f812db182c83bdc66ee0.jpg'

/** Giống layout.js — dùng khi API lỗi để generateMetadata không throw → tránh 500 / Facebook báo HTTP lỗi */
function fallbackMetadata({ title, description, path }) {
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${path}`,
      title,
      description,
      siteName: 'Ổ của Dưa',
      images: [{ url: DEFAULT_OG_IMAGE, alt: 'Ổ của Dưa' }],
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

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

async function fetchStorySafe(id) {
  try {
    const res = await API.Story.detail(id)
    const body = res?.data
    if (!body) return null
    return body
  } catch {
    return null
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const s = await fetchStorySafe(id)

  if (!s) {
    return fallbackMetadata({
      title: 'Không tìm thấy truyện',
      description: 'Truyện bạn tìm không tồn tại hoặc đã bị xóa.',
      path: `/story/${id}`,
    })
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
      siteName: 'Ổ của Dưa',
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
  }
}

export default async function Page({ params }) {
  const { id } = await params
  const story = await fetchStorySafe(id)
  return <StoryInfoPage story={story} />
}
