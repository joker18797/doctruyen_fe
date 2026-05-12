/**
 * jsDelivr gh proxy rejects repos > ~50 MB; same files work via raw.githubusercontent.com.
 */

/** Default OG / logo asset (same file as before, served from raw GitHub). */
export const DEFAULT_STATIC_BRAND_IMAGE =
  'https://raw.githubusercontent.com/joker18797/doctruyen_storage/main/uploads/1756106895153-z6768944788849_7bdce7562fe6f812db182c83bdc66ee0.jpg';

export function normalizeGithubCdnUrl(url) {
  if (typeof url !== 'string' || !url) return url;
  const m = url.match(/^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^/@]+)@([^/]+)\/(.+)$/);
  if (!m) return url;
  const [, user, repo, branch, path] = m;
  return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
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
