'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Inbox, Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDateTime, formatRelative } from '@/lib/format';
import { Button, ButtonLink } from '@/components/ui/button';
import {
  AdminPageHeader,
  Card,
  EmptyState,
  SearchInput,
  SkeletonRows,
  api,
  useConfirm,
  useToast,
} from '@/components/admin/ui';

const notifyShell = () => window.dispatchEvent(new Event('admin:inbox-changed'));

export default function InboxPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api('/api/contact')
      .then(({ data }) => setMessages(data))
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const unread = messages.filter((m) => !m.read).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((m) => {
      if (view === 'unread' && m.read) return false;
      if (!q) return true;
      return [m.name, m.email, m.subject, m.message].some((v) => v?.toLowerCase().includes(q));
    });
  }, [messages, view, query]);

  const selected = messages.find((m) => m.id === selectedId) || null;

  const setRead = useCallback(
    async (message, read) => {
      setMessages((list) => list.map((m) => (m.id === message.id ? { ...m, read: read ? 1 : 0 } : m)));
      try {
        await api(`/api/contact/${message.id}`, { method: 'PUT', body: { read } });
        notifyShell();
      } catch (err) {
        setMessages((list) => list.map((m) => (m.id === message.id ? { ...m, read: message.read } : m)));
        toast(err.message, 'error');
      }
    },
    [toast]
  );

  function open(message) {
    setSelectedId(message.id);
    if (!message.read) setRead(message, true);
  }

  async function remove(message) {
    const ok = await confirm({
      title: 'Delete message?',
      description: `The message from ${message.name} will be permanently deleted.`,
    });
    if (!ok) return;
    try {
      await api(`/api/contact/${message.id}`, { method: 'DELETE' });
      setMessages((list) => list.filter((m) => m.id !== message.id));
      setSelectedId(null);
      notifyShell();
      toast('Message deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Inbox"
        description={loading ? 'Loading…' : `${messages.length} messages · ${unread} unread`}
      />

      <Card className="grid min-h-[560px] overflow-hidden lg:grid-cols-[360px_1fr]">
        {/* List */}
        <div className={cn('flex flex-col border-border lg:border-r', selected && 'hidden lg:flex')}>
          <div className="space-y-3 border-b border-border p-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search messages…" />
            <div role="tablist" aria-label="Filter messages" className="grid grid-cols-2 rounded-md bg-subtle p-1 text-sm">
              {[
                ['all', `All`],
                ['unread', `Unread${unread ? ` (${unread})` : ''}`],
              ].map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={view === key}
                  onClick={() => setView(key)}
                  className={cn(
                    'h-8 rounded font-medium transition-colors',
                    view === key ? 'bg-background text-foreground shadow-sm' : 'text-muted hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <SkeletonRows rows={6} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={messages.length === 0 ? 'No messages yet' : 'Nothing here'}
              description={messages.length === 0 ? 'Contact form submissions will appear here.' : 'No messages match this view.'}
            />
          ) : (
            <ul className="flex-1 divide-y divide-border overflow-y-auto lg:max-h-[640px]">
              {visible.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => open(m)}
                    aria-current={m.id === selectedId ? 'true' : undefined}
                    className={cn(
                      'flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface',
                      m.id === selectedId && 'bg-subtle hover:bg-subtle'
                    )}
                  >
                    <span
                      className={cn('mt-1.5 size-2 shrink-0 rounded-full', m.read ? 'bg-transparent' : 'bg-accent')}
                      aria-label={m.read ? undefined : 'Unread'}
                    />
                    <span className="min-w-0 flex-1 space-y-0.5">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn('truncate text-sm', m.read ? 'text-muted' : 'font-semibold')}>{m.name}</span>
                        <span className="shrink-0 text-xs text-muted">{formatRelative(m.created_at)}</span>
                      </span>
                      <span className={cn('block truncate text-sm', !m.read && 'font-medium')}>{m.subject}</span>
                      <span className="block truncate text-xs text-muted">{m.message}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className={cn('flex flex-col', !selected && 'hidden lg:flex')}>
          {selected ? (
            <>
              <div className="flex items-center gap-2 border-b border-border px-3 py-2.5 sm:px-5">
                <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setSelectedId(null)} aria-label="Back to messages">
                  <ArrowLeft />
                </Button>
                <div className="ml-auto flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRead(selected, !selected.read)}
                  >
                    {selected.read ? <Mail /> : <MailOpen />}
                    <span className="hidden sm:inline">{selected.read ? 'Mark unread' : 'Mark read'}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(selected)}
                    className="hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
              <article className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-8">
                <header className="space-y-4">
                  <h2 className="text-xl font-semibold tracking-tight">{selected.subject}</h2>
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold uppercase text-accent-text">
                      {selected.name.charAt(0)}
                    </span>
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">{selected.name}</p>
                      <a href={`mailto:${selected.email}`} className="link break-all text-xs">{selected.email}</a>
                    </div>
                    <time className="ml-auto shrink-0 text-xs text-muted" dateTime={selected.created_at}>
                      {formatDateTime(selected.created_at)}
                    </time>
                  </div>
                </header>
                <p className="whitespace-pre-wrap text-pretty leading-relaxed">{selected.message}</p>
                <ButtonLink
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                  external
                >
                  <Reply />
                  Reply by email
                </ButtonLink>
              </article>
            </>
          ) : (
            <EmptyState icon={Mail} title="Select a message" description="Choose a message from the list to read it." />
          )}
        </div>
      </Card>
    </>
  );
}
