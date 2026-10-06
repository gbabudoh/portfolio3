import { Mail, MapPin, Phone } from 'lucide-react';
import { site } from '@/lib/site';
import { Icon } from '@/components/ui/icon';
import { PageHeader, Section } from '@/components/site/blocks';
import { ContactForm } from '@/components/site/contact-form';

export const metadata = {
  title: 'Contact',
  description: 'Start a conversation about your next web, mobile or AI-powered product.',
  alternates: { canonical: '/contact' },
};

const channels = [
  { icon: Mail, label: 'Email', value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: 'Phone', value: site.phone.display, href: site.phone.href },
  { icon: MapPin, label: 'Location', value: site.location },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's build something great."
        description="Share a little about your project and I'll reply with thoughts on approach, timeline and next steps."
      />
      <Section className="pt-12 sm:pt-16 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-20">
          <div className="max-w-2xl">
            <ContactForm />
          </div>

          <aside className="space-y-8 lg:border-l lg:border-border lg:pl-12">
            <div className="space-y-5">
              <p className="eyebrow">Direct</p>
              <ul className="space-y-5">
                {channels.map(({ icon: ChannelIcon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-muted">
                      <ChannelIcon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-muted">{label}</span>
                      {href ? (
                        <a href={href} className="break-words text-sm font-medium hover:text-accent-text">
                          {value}
                        </a>
                      ) : (
                        <span className="text-sm font-medium">{value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 border-t border-border pt-8">
              <p className="eyebrow">Elsewhere</p>
              <ul className="flex gap-2">
                {site.socials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="grid size-10 place-items-center rounded-md border border-border text-muted transition-colors hover:bg-subtle hover:text-foreground"
                    >
                      <Icon name={social.icon} className="size-[18px]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
