import { site } from '@/lib/site';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${site.url}/sitemap.xml
`;

  return new Response(robotsTxt, { headers: { 'Content-Type': 'text/plain' } });
}
