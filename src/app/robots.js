const BASE = 'https://ocuadua.com'

/**
 * Meta / Facebook crawlers — chỉ Allow: / (toàn site).
 * Tránh nhiều dòng Allow + Host dạng URL có thể làm parser của Sharing Debugger báo lỗi.
 * @see https://developers.facebook.com/docs/sharing/webmasters/web-crawlers
 */
const META_AND_SOCIAL_BOTS = [
  'facebookexternalhit',
  'Facebot',
  'FacebookBot',
  'Meta-ExternalAgent',
  'LinkedInBot',
  'Twitterbot',
  'Slackbot',
]

export default function robots() {
  const metaRules = META_AND_SOCIAL_BOTS.map((userAgent) => ({
    userAgent,
    allow: ['/'],
  }))

  return {
    rules: [
      ...metaRules,
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/admin/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/'],
        disallow: ['/admin/'],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/'],
        disallow: ['/admin/'],
      },
      {
        userAgent: 'Applebot',
        allow: ['/'],
        disallow: ['/admin/'],
      },
      {
        userAgent: 'Zalo',
        allow: ['/'],
        disallow: ['/admin/'],
      },
      {
        userAgent: '*',
        disallow: ['/admin/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
