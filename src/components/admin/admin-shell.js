'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Briefcase,
  Code2,
  ExternalLink,
  FileText,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { site } from '@/lib/site';
import { useDialog } from '@/lib/use-dialog';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ConfirmProvider, ToastProvider } from '@/components/admin/ui';

const NAV = [
  { group: null, items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }] },
  {
    group: 'Content',
    items: [
      { label: 'Projects', href: '/admin/projects', icon: Briefcase },
      { label: 'Experience', href: '/admin/experience', icon: History },
      { label: 'Skills', href: '/admin/skills', icon: Code2 },
      { label: 'About', href: '/admin/about', icon: FileText },
      { label: 'Stats', href: '/admin/stats', icon: BarChart3 },
    ],
  },
  {
    group: 'Engagement',
    items: [{ label: 'Inbox', href: '/admin/messages', icon: Inbox, badge: 'unread' }],
  },
  { group: 'System', items: [{ label: 'Settings', href: '/admin/settings', icon: Settings }] },
];

const ALL_ITEMS = NAV.flatMap((g) => g.items);

function isActive(pathname, href) {
  return href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({ pathname, unread, onNavigate }) {
  return (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {NAV.map((section, i) => (
        <div key={section.group || i} className="space-y-1">
          {section.group && (
            <p className="px-3 pb-1 font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              {section.group}
            </p>
          )}
          {section.items.map((item) => {
            const active = isActive(pathname, item.href);
            const NavIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                  active ? 'bg-subtle text-foreground' : 'text-muted hover:bg-subtle/60 hover:text-foreground'
                )}
              >
                <NavIcon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.badge === 'unread' && unread > 0 && (
                  <span className="rounded-full bg-accent px-1.5 py-px text-[11px] font-semibold text-accent-foreground">
                    {unread}
                    <span className="sr-only"> unread</span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarBrand({ className }) {
  return (
    <Link href="/admin" className={cn('flex h-14 shrink-0 items-center gap-2.5 px-5', className)}>
      <span className="grid size-7 place-items-center rounded-md bg-foreground font-mono text-xs font-semibold text-background">
        {site.name.charAt(0)}
      </span>
      <span className="text-sm font-semibold tracking-tight">{site.name}</span>
      <span className="rounded border border-border px-1.5 py-px font-mono text-[10px] uppercase text-muted">Admin</span>
    </Link>
  );
}

export function AdminShell({ session, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const drawerRef = useDialog(drawerOpen, () => setDrawerOpen(false));

  const current = ALL_ITEMS.find((item) => isActive(pathname, item.href));

  // Unread count for the Inbox badge; refreshed on navigation and when the inbox changes.
  useEffect(() => {
    let cancelled = false;
    const refresh = () =>
      fetch('/api/contact')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled && d?.success) setUnread(d.data.filter((m) => !m.read).length);
        })
        .catch(() => {});
    refresh();
    window.addEventListener('admin:inbox-changed', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('admin:inbox-changed', refresh);
    };
  }, [pathname]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    router.replace('/admin/login');
    router.refresh();
  }

  const account = (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-md px-2 py-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold uppercase text-accent-text">
          {session.username?.charAt(0) || 'A'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{session.username}</p>
          <p className="text-xs text-muted">Administrator</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={logout} aria-label="Sign out" title="Sign out">
          <LogOut />
        </Button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-dvh bg-surface">
          {/* Desktop sidebar */}
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-background lg:flex">
            <SidebarBrand className="border-b border-border" />
            <SidebarNav pathname={pathname} unread={unread} />
            {account}
          </aside>

          {/* Mobile drawer */}
          {drawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
              <div
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Admin navigation"
                className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] animate-slide-in-left flex-col bg-background shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border pr-3">
                  <SidebarBrand />
                  <Button variant="ghost" size="icon-sm" onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
                    <X />
                  </Button>
                </div>
                <SidebarNav pathname={pathname} unread={unread} onNavigate={() => setDrawerOpen(false)} />
                {account}
              </div>
            </div>
          )}

          <div className="lg:pl-60">
            <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-lg sm:px-6">
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation"
                aria-expanded={drawerOpen}
              >
                <Menu />
              </Button>
              <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
                <ol className="flex items-center gap-2 text-sm">
                  <li className="hidden text-muted sm:block">Admin</li>
                  <li className="hidden text-muted/50 sm:block" aria-hidden="true">/</li>
                  <li className="truncate font-medium" aria-current="page">{current?.label || 'Dashboard'}</li>
                </ol>
              </nav>
              <ThemeToggle className="size-8" />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open('/', '_blank', 'noopener')}
                className="hidden sm:inline-flex"
              >
                View site
                <ExternalLink />
              </Button>
            </header>

            <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
              {children}
            </main>
          </div>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
