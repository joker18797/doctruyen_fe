/**
 * raw.githubusercontent.com is not a CDN and rate-limits (HTTP 429) under real traffic.
 * Serve the same GitHub files through the jsDelivr CDN instead, which is what the
 * backend already stores. This util defensively upgrades any stray raw URL to jsDelivr.
 */

/** Default OG / logo asset, served from the jsDelivr CDN. */
export const DEFAULT_STATIC_BRAND_IMAGE =
  'https://cdn.jsdelivr.net/gh/joker18797/doctruyen_storage@main/uploads/1756106895153-z6768944788849_7bdce7562fe6f812db182c83bdc66ee0.jpg';

export function normalizeGithubCdnUrl(url) {
  if (typeof url !== 'string' || !url) return url;
  const m = url.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/);
  if (!m) return url;
  const [, user, repo, branch, path] = m;
  return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${path}`;
}

export function rewriteDeepJsDelivrGithubUrls(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return normalizeGithubCdnUrl(value);
  if (typeof value !== 'object') return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(rewriteDeepJsDelivrGithubUrls);
  const out = {};
  for (const k of Object.keys(value)) {
    out[k] = rewriteDeepJsDelivrGithubUrls(value[k]);
  }
  return out;
}
