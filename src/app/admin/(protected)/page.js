import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Briefcase, Eye, Inbox, Plus, Users } from 'lucide-react';
import { getAnalyticsSummary, getContentCounts, getRecentMessages } from '@/lib/insights';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ButtonLink } from '@/components/ui/button';
import { AdminPageHeader, Card, CardHeader, EmptyState } from '@/components/admin/primitives';
import { ViewsChart } from '@/components/admin/views-chart';

export const metadata = { title: 'Dashboard' };

const compact = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 });

function StatTile({ label, value, detail, icon: TileIcon, href }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <TileIcon className="size-4 text-muted" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{compact.format(value)}</p>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </>
  );
  const classes = 'block rounded-lg border border-border bg-background p-5 transition-colors';
  return href ? (
    <Link href={href} className={cn(classes, 'hover:border-foreground/20')}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

export default function DashboardPage() {
  const analytics = getAnalyticsSummary();
  const counts = getContentCounts();
  const messages = getRecentMessages(5);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Traffic, enquiries and content at a glance."
        actions={
          <ButtonLink href="/admin/projects?new=1">
            <Plus />
            New project
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Visitors this month"
          value={analytics.month.visitors}
          detail={`${analytics.today.visitors.toLocaleString('en-GB')} today`}
          icon={Users}
        />
        <StatTile
          label="Page views (7 days)"
          value={analytics.week.pageViews}
          detail={`${analytics.total.pageViews.toLocaleString('en-GB')} all time`}
          icon={Eye}
        />
        <StatTile
          label="Unread messages"
          value={counts.unread}
          detail={`${counts.messages} total`}
          icon={Inbox}
          href="/admin/messages"
        />
        <StatTile
          label="Projects"
          value={counts.projects}
          detail={`${counts.featured} featured`}
          icon={Briefcase}
          href="/admin/projects"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Page views" description="Daily views over the last 14 days" />
          <ViewsChart data={analytics.daily} />
        </Card>

        <Card>
          <CardHeader title="Top pages" description="By all-time views" />
          {analytics.topPages.length === 0 ? (
            <EmptyState icon={Eye} title="No traffic yet" />
          ) : (
            <ol className="divide-y divide-border">
              {analytics.topPages.map((page) => (
                <li key={page.page_path} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <span className="truncate font-mono text-xs">{page.page_path}</span>
                  <span className="shrink-0 tabular-nums text-muted">{page.views.toLocaleString('en-GB')}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent messages"
            action={
              <Link href="/admin/messages" className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground">
                Open inbox
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />
          {messages.length === 0 ? (
            <EmptyState icon={Inbox} title="No messages yet" description="Contact form submissions will appear here." />
          ) : (
            <ul className="divide-y divide-border">
              {messages.map((m) => (
                <li key={m.id}>
                  <Link href="/admin/messages" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface">
                    <span className={cn('size-2 shrink-0 rounded-full', m.read ? 'bg-transparent' : 'bg-accent')} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-sm', !m.read && 'font-semibold')}>
                        {m.name} <span className="font-normal text-muted">· {m.subject}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{formatRelative(m.created_at)}</span>
                    {!m.read && <span className="sr-only">Unread</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Engagement" description="Averages across all sessions" />
          <dl className="divide-y divide-border">
            {[
              ['Time on page', `${analytics.engagement.avgTimeOnPage}s`],
              ['Scroll depth', `${analytics.engagement.avgScrollDepth}%`],
              ['Interactions', analytics.engagement.avgInteractions],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-5 py-3 text-sm">
                <dt className="text-muted">{label}</dt>
                <dd className="font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-border p-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-muted transition-colors hover:bg-subtle hover:text-foreground"
            >
              View live site
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </Card>
      </div>
    </>
  );
}
