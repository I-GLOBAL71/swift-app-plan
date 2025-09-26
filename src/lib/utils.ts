import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Image utilities
export function ensureHttps(url: string): string {
  if (!url) return url;
  let u = url.trim();
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('http://')) return u.replace(/^http:\/\//, 'https://');
  return u;
}

export function toImagesArray(value: unknown): string[] {
  try {
    if (Array.isArray(value)) {
      return Array.from(new Set(
        value
          .filter((v): v is string => typeof v === 'string')
          .map(ensureHttps)
      ));
    }
    if (typeof value === 'string') {
      const s = value.trim();
      // Try JSON array
      if (s.startsWith('[') && s.endsWith(']')) {
        const parsed = JSON.parse(s);
        return toImagesArray(parsed);
      }
      // Split common delimiters
      const parts = s.split(/\s*,\s*|\s*\n\s*|\s*\|\s*/).filter(Boolean);
      const urls = (parts.length > 1 ? parts : [s])
        .map(ensureHttps)
        .filter(p => /^https?:\/\//.test(p) || p.startsWith('data:'));
      return Array.from(new Set(urls));
    }
  } catch (_) {
    // ignore parsing errors
  }
  return [];
}
