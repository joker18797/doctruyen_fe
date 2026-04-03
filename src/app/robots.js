const BASE = 'https://ocuadua.com'

/**
 * facebookexternalhit / Facebot: chỉ Allow / — không Disallow (đúng hướng dẫn Facebook).
 * Các bot khác + *: vẫn disallow /admin/.
 * Lưu ý: Debugger vẫn báo câu này nếu URL trả 403 (WAF) — không phải lỗi robots.
 */
export default function robots() {
  const sharedDisallow = ['/admin/']

  return {
    rules: [
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Facebot',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: sharedDisallow,
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Slackbot',
        allow: '/',
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Zalo',
        allow: '/',
        disallow: sharedDisallow,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: sharedDisallow,
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
