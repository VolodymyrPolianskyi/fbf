// Redirect targets that come from a request must stay on this site. A path
// like "@evil.com", "//evil.com" or "/\evil.com" glued onto the origin, or
// handed to the browser, would send people to someone else's page.
export function safePath(path: string | null | undefined, fallback = "/") {
  return path && /^\/(?![/\\])/.test(path) ? path : fallback;
}
