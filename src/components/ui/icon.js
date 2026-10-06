import {
  Dribbble,
  Facebook,
  Gauge,
  Github,
  Globe,
  Instagram,
  Layers,
  Linkedin,
  Mail,
  Smartphone,
  Sparkles,
  Youtube,
} from 'lucide-react';

// The current X (formerly Twitter) logo. Lucide only ships the old bird, so this is
// drawn inline; it's a filled mark, scaled slightly so it sits evenly beside the
// outline icons.
function XLogo({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
      <path
        transform="translate(2.4 2.4) scale(0.8)"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

// Lets config files and stored settings reference icons by name.
const icons = {
  dribbble: Dribbble,
  facebook: Facebook,
  gauge: Gauge,
  github: Github,
  instagram: Instagram,
  layers: Layers,
  linkedin: Linkedin,
  mail: Mail,
  smartphone: Smartphone,
  sparkles: Sparkles,
  website: Globe,
  x: XLogo,
  youtube: Youtube,
};

export function Icon({ name, ...props }) {
  const Component = icons[name];
  if (!Component) return null;
  if (Component === XLogo) return <XLogo {...props} />;
  return <Component strokeWidth={1.75} aria-hidden="true" {...props} />;
}
