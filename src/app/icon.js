import { ImageResponse } from 'next/og';
import { site } from '@/lib/site';

// Favicon: the "G" brand mark (black rounded square, white bold Geist Mono letter),
// matching the header logo. Rendered to PNG at build time.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

const LETTER = site.name.charAt(0);

// Fetch just the one glyph we need from Google Fonts. Falls back to the default
// font if the network is unavailable at build time.
export async function loadBrandFont() {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Geist+Mono:wght@700&text=${encodeURIComponent(LETTER)}`)
    ).text();
    const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return [];
    const data = await (await fetch(url)).arrayBuffer();
    return [{ name: 'Geist Mono', data, weight: 700, style: 'normal' }];
  } catch {
    return [];
  }
}

export function BrandMark({ px }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        borderRadius: px * 0.22,
        color: '#ffffff',
        fontSize: px * 0.56,
        fontWeight: 700,
        fontFamily: 'Geist Mono',
      }}
    >
      {LETTER}
    </div>
  );
}

export default async function Icon() {
  return new ImageResponse(<BrandMark px={size.width} />, { ...size, fonts: await loadBrandFont() });
}
