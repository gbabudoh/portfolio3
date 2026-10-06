// Single source of truth for identity, contact details and navigation.

export const site = {
  name: 'Godwin',
  fullName: 'Godwin',
  role: 'Full-Stack Engineer & Solution Architect',
  tagline:
    'I design and build scalable web, mobile and commerce platforms — pairing deep full-stack engineering with an AI-native workflow to ship faster without cutting corners.',
  url: 'https://godwinportfolio.com',
  email: 'gbabudoh@gmail.com',
  phone: { display: '+44 (0) 7814483083', href: 'tel:+447814483083' },
  location: 'United Kingdom · Remote',
  availability: 'Available for new projects',
  socials: [
    { name: 'GitHub', href: 'https://github.com/gbabudoh', icon: 'github' },
    { name: 'LinkedIn', href: 'https://linkedin.com/in/gbabudoh', icon: 'linkedin' },
    { name: 'X (Twitter)', href: 'https://twitter.com/gbabudoh', icon: 'twitter' },
  ],
};

export const mainNav = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const capabilities = [
  {
    icon: 'layers',
    title: 'End-to-end architecture',
    description:
      'Reactive frontends, robust APIs and cloud-native infrastructure designed as one coherent system.',
  },
  {
    icon: 'smartphone',
    title: 'Web & mobile products',
    description:
      'Native-grade iOS and Android apps with React Native, sharing logic and backends with the web.',
  },
  {
    icon: 'sparkles',
    title: 'AI-native delivery',
    description:
      'Agentic tooling and LLM integration that accelerate delivery while holding a strict quality bar.',
  },
  {
    icon: 'gauge',
    title: 'Performance & SEO',
    description:
      'Sub-second load times and top-tier Core Web Vitals, built for discoverability and retention.',
  },
];
