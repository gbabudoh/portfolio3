// Supported social platforms. Shared by the admin editor and the public site.
// `hosts` restricts which domains a link may point to (empty = any https URL).
export const SOCIAL_PLATFORMS = {
  github: { label: 'GitHub', hosts: ['github.com'], placeholder: 'https://github.com/username' },
  linkedin: { label: 'LinkedIn', hosts: ['linkedin.com'], placeholder: 'https://linkedin.com/in/username' },
  x: { label: 'X', hosts: ['x.com', 'twitter.com'], placeholder: 'https://x.com/username' },
  instagram: { label: 'Instagram', hosts: ['instagram.com'], placeholder: 'https://instagram.com/username' },
  youtube: { label: 'YouTube', hosts: ['youtube.com', 'youtu.be'], placeholder: 'https://youtube.com/@channel' },
  facebook: { label: 'Facebook', hosts: ['facebook.com'], placeholder: 'https://facebook.com/username' },
  dribbble: { label: 'Dribbble', hosts: ['dribbble.com'], placeholder: 'https://dribbble.com/username' },
  website: { label: 'Website', hosts: [], placeholder: 'https://example.com' },
};

export const MAX_SOCIAL_LINKS = 10;

// Returns an error message, or null when the link is valid.
export function validateSocialLink(link) {
  const platform = SOCIAL_PLATFORMS[link?.platform];
  if (!platform) return 'Choose a platform.';
  let url;
  try {
    url = new URL(String(link.url || '').trim());
  } catch {
    return `Enter a full ${platform.label} address, e.g. ${platform.placeholder}`;
  }
  if (url.protocol !== 'https:') return 'Links must start with https://';
  const host = url.hostname.replace(/^www\./, '');
  if (platform.hosts.length && !platform.hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
    return `That doesn’t look like a ${platform.label} link (${platform.hosts[0]}).`;
  }
  return null;
}
