import { ImageResponse } from 'next/og';
import { BrandMark, loadBrandFont } from './icon';

// Home-screen icon for iOS (180×180), same brand mark as the favicon.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  return new ImageResponse(<BrandMark px={size.width} />, { ...size, fonts: await loadBrandFont() });
}
