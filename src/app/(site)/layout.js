import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import AnalyticsScript from '@/components/AnalyticsScript';
import { TrackingScripts } from '@/components/site/tracking-scripts';
import { getIntegrationSettings } from '@/lib/settings';

export default function SiteLayout({ children }) {
  const integrations = getIntegrationSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <AnalyticsScript />
      <TrackingScripts gaId={integrations.ga_measurement_id} clarityId={integrations.clarity_project_id} />
    </div>
  );
}
