export function topicHref(slug: string, hash?: string): string {
  const suffix = hash ? `#${hash}` : "";
  return `/topic?slug=${encodeURIComponent(slug)}${suffix}`;
}
