import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import AnalyticsScript from '@/components/AnalyticsScript';
import { TrackingScripts } from '@/components/site/tracking-scripts';
import { getCv, getIntegrationSettings, getVisibleSocialLinks } from '@/lib/settings';
import { site } from '@/lib/site';

export default function SiteLayout({ children }) {
  const integrations = getIntegrationSettings();
  const hasCv = Boolean(getCv());
  const socials = getVisibleSocialLinks();

  // schema.org profile for search engines; sameAs lists the managed social links.
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.fullName,
    jobTitle: site.role,
    url: site.url,
    email: `mailto:${site.email}`,
    sameAs: socials.map((s) => s.url),
    knowsAbout: ['Next.js', 'React', 'Node.js', 'React Native', 'TypeScript', 'Cloud infrastructure', 'AI engineering'],
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <SiteHeader hasCv={hasCv} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter socials={socials} />
      <AnalyticsScript />
      <TrackingScripts gaId={integrations.ga_measurement_id} clarityId={integrations.clarity_project_id} />
    </div>
  );
}
