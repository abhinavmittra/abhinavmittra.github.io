/** Add the configured deployment prefix to app routes and public assets. */
export const siteBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

export function sitePath(path: string): string {
  if (!siteBasePath || !path.startsWith('/') || path.startsWith('//')) return path;
  return `${siteBasePath}${path}`;
}
