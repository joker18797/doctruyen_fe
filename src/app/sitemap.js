const BASE = 'https://ocuadua.com'

const STATIC_PATHS = [
  '',
  '/ranking',
  '/search',
  '/about',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/forgot-password',
]

/**
 * Lấy toàn bộ truyện published qua API (phân trang).
 * Cần NEXT_PUBLIC_URL_API trên server (giống axios phía client).
 */
async function fetchAllStoryEntries() {
  const apiBase = process.env.NEXT_PUBLIC_URL_API?.replace(/\/$/, '')
  if (!apiBase) return []

  const limit = 500
  const entries = []
  let page = 1
  let totalPages = 1

  try {
    while (page <= totalPages) {
      const url = `${apiBase}/api/story?page=${page}&limit=${limit}`
      const res = await fetch(url, {
        next: { revalidate: 3600 },
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) break

      const json = await res.json()
      const stories = Array.isArray(json.data) ? json.data : []
      const pag = json.pagination || {}
      totalPages = Math.max(1, Number(pag.totalPages) || 1)

      for (const s of stories) {
        const segment = s.slug || s._id
        if (segment == null || segment === '') continue
        const pathSeg =
          typeof segment === 'string' ? segment : String(segment)

        entries.push({
          url: `${BASE}/story/${encodeURIComponent(pathSeg)}`,
          lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }

      page += 1
    }
  } catch {
    /* API lỗi — trả ít nhất URL tĩnh */
  }

  return entries
}

export default async function sitemap() {
  const now = new Date()

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  const storyEntries = await fetchAllStoryEntries()

  return [...staticEntries, ...storyEntries]
}
