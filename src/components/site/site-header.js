'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { mainNav, site } from '@/lib/site';
import { cn } from '@/lib/cn';
import { useDialog } from '@/lib/use-dialog';
import { Button, ButtonLink } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useDialog(menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-colors duration-200',
        scrolled
          ? 'border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70'
          : 'border-transparent bg-background'
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-accent-foreground"
      >
        Skip to content
      </a>

      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-md" aria-label={`${site.name} — home`}>
          <span className="grid size-8 place-items-center rounded-md bg-foreground font-mono text-sm font-semibold text-background">
            {site.name.charAt(0)}
          </span>
          <span className="font-semibold tracking-tight">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active ? 'bg-subtle text-foreground' : 'text-muted hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink href="/contact" size="sm" className="ml-2 hidden md:inline-flex">
            Let&apos;s talk
          </ButtonLink>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Menu />
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-foreground/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm animate-slide-in-right flex-col bg-background shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <span className="font-semibold tracking-tight">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X />
              </Button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {[{ label: 'Home', href: '/' }, ...mainNav].map((item) => {
                  const active = item.href === '/' ? pathname === '/' : isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex min-h-12 items-center justify-between rounded-md px-3 text-lg font-medium transition-colors',
                          active ? 'bg-subtle text-foreground' : 'text-muted hover:bg-subtle hover:text-foreground'
                        )}
                      >
                        {item.label}
                        {active && <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="space-y-3 border-t border-border p-5">
              <a href={`mailto:${site.email}`} className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
                {site.email}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
              <ButtonLink href="/contact" size="lg" className="w-full">
                Let&apos;s talk
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
