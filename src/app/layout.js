import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { site } from '@/lib/site';

const sans = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const description =
  'Full-stack engineer and solution architect building scalable SaaS, web, mobile and commerce platforms with React, Next.js, Node.js and an AI-native workflow.';

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s · ${site.name}`,
  },
  description,
  keywords: [
    'full-stack developer',
    'solution architect',
    'Next.js developer',
    'React developer',
    'Node.js developer',
    'React Native developer',
    'SaaS development',
    'e-commerce development',
    'AI engineering',
    'UK freelance developer',
  ],
  authors: [{ name: site.fullName, url: site.url }],
  creator: site.fullName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: site.url,
    siteName: `${site.name} — Portfolio`,
    title: `${site.name} — ${site.role}`,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.role}`,
    description,
  },
  robots: { index: true, follow: true },
  // Google Search Console ownership check (renders <meta name="google-site-verification">).
  verification: {
    google: 'PVkNCRcNENOiqTOaXDCnvkB1DxQzRXIVXiuetWq2pzY',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};


export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
