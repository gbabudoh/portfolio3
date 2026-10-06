import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import AnalyticsScript from '@/components/AnalyticsScript';

export default function SiteLayout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <AnalyticsScript />
    </div>
  );
}
