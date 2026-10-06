import Script from 'next/script';

// Third-party trackers for the public site only — the admin layout never renders
// this, so admin sessions are not tracked. IDs come from Admin → Settings and are
// validated against strict patterns before reaching this component.
export function TrackingScripts({ gaId, clarityId }) {
  // Skip in development so local testing doesn't pollute the dashboards.
  if (process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', ${JSON.stringify(gaId)});`}
          </Script>
        </>
      )}
      {clarityId && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", ${JSON.stringify(clarityId)});`}
        </Script>
      )}
    </>
  );
}
