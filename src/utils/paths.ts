/**
 * Ensure an absolute path is properly prefixed with Astro's base URL.
 * When base is '/site', withBase('/site.css') -> '/site/site.css'.
 * withBase('/') -> '/site/'.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  if (!path || path === "/") {
    return `${base}/`;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (base && cleanPath.startsWith(`${base}/`)) {
    return cleanPath;
  }
  return `${base}${cleanPath}`;
}
