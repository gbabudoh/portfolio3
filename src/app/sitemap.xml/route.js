import { site } from '@/lib/site';
import { getProjects } from '@/lib/content';

export const revalidate = 3600;

export async function GET() {
  const now = new Date().toISOString();
  const pages = [
    { path: '', priority: 1.0, changefreq: 'monthly', lastmod: now },
    { path: '/work', priority: 0.9, changefreq: 'weekly', lastmod: now },
    { path: '/about', priority: 0.8, changefreq: 'monthly', lastmod: now },
    { path: '/contact', priority: 0.6, changefreq: 'yearly', lastmod: now },
    ...getProjects().map((p) => ({
      path: `/work/${p.slug}`,
      priority: 0.7,
      changefreq: 'monthly',
      lastmod: p.createdAt ? new Date(`${p.createdAt.replace(' ', 'T')}Z`).toISOString() : now,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${site.url}${p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
