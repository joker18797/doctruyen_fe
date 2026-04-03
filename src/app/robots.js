const BASE = 'https://ocuadua.com'

/**
 * Robots cho crawler: Facebook / Zalo / Google cần thấy Allow rõ ràng.
 * Không chặn /story/* — preview link phụ thuộc HTML + OG.
 * Chỉ hạn /admin/ (trang quản trị không cần index).
 */
export default function robots() {
  const sharedDisallow = ['/admin/']

  return {
    rules: [
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
        disallow: sharedDisallow,
      },
      {
        userAgent: 'Facebot',
        allow: '/',
        disallow: sharedDisallow,
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
