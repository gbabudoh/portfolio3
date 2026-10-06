import {
  Gauge,
  Github,
  Layers,
  Linkedin,
  Mail,
  Smartphone,
  Sparkles,
  Twitter,
} from 'lucide-react';

// Lets config files (src/lib/site.js) reference icons by name.
const icons = {
  gauge: Gauge,
  github: Github,
  layers: Layers,
  linkedin: Linkedin,
  mail: Mail,
  smartphone: Smartphone,
  sparkles: Sparkles,
  twitter: Twitter,
};

export function Icon({ name, ...props }) {
  const Component = icons[name];
  return Component ? <Component strokeWidth={1.75} aria-hidden="true" {...props} /> : null;
}
