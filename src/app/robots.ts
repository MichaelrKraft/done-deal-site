import type { MetadataRoute } from 'next';

const SITE_URL = 'https://done-deal.co';

/**
 * Generates robots.txt, allowing all crawlers on public marketing routes
 * and pointing to the sitemap. Served at /robots.txt by the Next.js App Router.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
