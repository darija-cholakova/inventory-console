const DEFAULT_URL = '/products';

/**
 * Accepts only in-app paths as a post-login redirect target.
 * Blocks absolute and protocol-relative URLs (open redirect) and loops back to /login.
 */
export function safeReturnUrl(url: string | null | undefined): string {
  if (!url || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/login')) {
    return DEFAULT_URL;
  }
  return url;
}
