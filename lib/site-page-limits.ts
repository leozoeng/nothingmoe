export const MAX_FEATURES = 8;
export const MAX_FEATURE_LENGTH = 40;
export const MIN_TAGLINE_LENGTH = 8;
export const MAX_TAGLINE_LENGTH = 90;
export const MAX_BANNER_BYTES = 50 * 1024 * 1024;
export const MAX_DESCRIPTION_LENGTH = 3000;

export const BANNER_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

const BANNER_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function bannerExtForType(type: string) {
  return BANNER_EXT[type] ?? null;
}

export function isValidBannerUrl(url: string) {
  if (!url || url.length > 2048) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  return /^https?:\/\/.+/i.test(url);
}

export function normalizeFeatureList(items: string[] | undefined | null) {
  if (!items) return [];
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_FEATURES)
    .map((item) => item.slice(0, MAX_FEATURE_LENGTH));
}
