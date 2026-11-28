import type { MetadataRoute } from 'next';

/** Allow crawling everywhere except API routes and the duplicate /light page. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/light'] } };
}
