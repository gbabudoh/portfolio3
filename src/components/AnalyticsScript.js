'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import analytics from '@/lib/analytics';

export default function AnalyticsScript() {
  const pathname = usePathname();

  useEffect(() => {
    analytics.startTracking();
  }, []);

  // Client-side navigations don't reload the page, so record each route change.
  useEffect(() => {
    analytics.trackPageView(pathname);
  }, [pathname]);

  return null;
}
