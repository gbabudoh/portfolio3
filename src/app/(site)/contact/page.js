import { ChevronRight, Mail, MapPin, Phone } from 'lucide-react';
import { site } from '@/lib/site';
import { Icon } from '@/components/ui/icon';
import { ButtonLink } from '@/components/ui/button';
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
      >
        {/* One-tap shortcuts for mobile users who'd rather not fill in a form */}
        <div className="flex gap-3 pt-1 lg:hidden">
          <ButtonLink href={`mailto:${site.email}`} external={false} variant="secondary" size="lg" className="flex-1 sm:flex-none">
            <Mail />
            Email me
          </ButtonLink>
          <ButtonLink href={site.phone.href} external={false} variant="secondary" size="lg" className="flex-1 sm:flex-none">
            <Phone />
            Call
          </ButtonLink>
        </div>
      </PageHeader>
      <Section className="pt-10 sm:pt-16 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-20">
          <div className="max-w-2xl">
            <ContactForm />
          </div>

          <aside className="space-y-8 border-t border-border pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <div className="space-y-3">
              <h2 className="eyebrow">Direct</h2>
              <ul className="-mx-3 space-y-1">
                {channels.map(({ icon: ChannelIcon, label, value, href }) => {
                  const content = (
                    <>
                      <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-background text-muted transition-colors group-hover:border-accent/40 group-hover:text-accent-text">
                        <ChannelIcon className="size-[18px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs text-muted">{label}</span>
                        <span className="block break-words text-[15px] font-medium sm:text-sm">{value}</span>
                      </span>
                      {href && (
                        <ChevronRight
                          className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </>
                  );
                  const row = 'flex min-h-14 items-center gap-3 rounded-lg px-3 py-2';
                  return (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          className={`group ${row} transition-colors hover:bg-subtle active:bg-subtle`}
                          aria-label={`${label}: ${value}`}
                        >
                          {content}
                        </a>
                      ) : (
                        <div className={row}>{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-4 border-t border-border pt-8">
              <h2 className="eyebrow">Elsewhere</h2>
              <ul className="flex gap-3">
                {site.socials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.name} (opens in a new tab)`}
                      className="grid size-11 place-items-center rounded-md border border-border text-muted transition-colors hover:bg-subtle hover:text-foreground active:bg-subtle"
                    >
                      <Icon name={social.icon} className="size-5" />
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
