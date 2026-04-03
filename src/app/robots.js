const BASE = 'https://ocuadua.com'

/** Toàn site + trang truyện — preview link / SEO cần crawl được /story/... */
const ALLOW_PUBLIC = ['/', '/story/']

/**
 * facebookexternalhit / Facebot: allow rõ / và /story/ (không Disallow).
 * Bot khác + *: allow cùng path, chỉ chặn /admin/.
 */
export default function robots() {
  const sharedDisallow = ['/admin/']

  return {
    rules: [
      {
        userAgent: 'facebookexternalhit',
        allow: ALLOW_PUBLIC,
      },
      {
        userAgent: 'Facebot',
        allow: ALLOW_PUBLIC,
      },
      {
        userAgent: 'Googlebot',
        allow: ALLOW_PUBLIC,
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ALLOW_PUBLIC,
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Bingbot',
        allow: ALLOW_PUBLIC,
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Applebot',
        allow: ALLOW_PUBLIC,
        disallow: sharedDisallow,
      },
      {
        userAgent: 'LinkedInBot',
        allow: ALLOW_PUBLIC,
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Twitterbot',
        allow: ALLOW_PUBLIC,
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Slackbot',
        allow: ALLOW_PUBLIC,
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Zalo',
        allow: ALLOW_PUBLIC,
        disallow: sharedDisallow,
      },
      {
        userAgent: '*',
        allow: ALLOW_PUBLIC,
        disallow: sharedDisallow,
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
