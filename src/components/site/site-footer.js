import Link from 'next/link';
import { mainNav, site } from '@/lib/site';
import { Icon } from '@/components/ui/icon';

export function SiteFooter({ socials = [] }) {
  return (
    <footer className="border-t border-border">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-2">
          <p className="font-semibold tracking-tight">{site.name}</p>
          <p className="max-w-sm text-sm text-muted">{site.role} · {site.location}</p>
          {socials.length > 0 && (
            <div className="flex gap-1 pt-1">
              {socials.map((social) => (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.label} (opens in a new tab)`}
                  className="grid size-10 place-items-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-foreground"
                >
                  <Icon name={social.platform} className="size-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Navigate</p>
          <ul className="space-y-2.5 text-sm">
            {[{ label: 'Home', href: '/' }, ...mainNav].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="text-muted transition-colors hover:text-foreground">
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.phone.href} className="text-muted transition-colors hover:text-foreground">
                {site.phone.display}
              </a>
            </li>
            <li className="text-muted">{site.location}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Built with Next.js</p>
        </div>
      </div>
    </footer>
  );
}
