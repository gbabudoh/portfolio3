'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MAX_SOCIAL_LINKS, SOCIAL_PLATFORMS, validateSocialLink } from '@/lib/social-platforms';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { useToast } from '@/components/admin/ui';

// Stable client-side keys so rows keep focus/state while being reordered.
let nextKey = 0;
const withKeys = (links) => links.map((l) => ({ ...l, _key: ++nextKey }));
const strip = (links) => links.map(({ _key, ...l }) => l);

export function SocialLinksForm({ initial }) {
  const toast = useToast();
  const [links, setLinks] = useState(() => withKeys(initial));
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(strip(links)) !== JSON.stringify(saved);

  function update(index, patch) {
    setLinks((list) => list.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    setErrors((e) => ({ ...e, [index]: undefined }));
  }

  function move(index, step) {
    setLinks((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + step, 0, item);
      return next;
    });
    setErrors({});
  }

  function remove(index) {
    setLinks((list) => list.filter((_, i) => i !== index));
    setErrors({});
  }

  function add() {
    const used = new Set(links.map((l) => l.platform));
    const platform = Object.keys(SOCIAL_PLATFORMS).find((p) => !used.has(p)) || 'website';
    setLinks((list) => [...list, ...withKeys([{ platform, url: '', visible: true }])]);
  }

  async function save(event) {
    event.preventDefault();
    const clientErrors = {};
    links.forEach((l, i) => {
      const error = validateSocialLink(l);
      if (error) clientErrors[i] = error;
    });
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSaving(true);
    try {
      const res = await fetch('/api/socials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: strip(links) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.error || 'Failed to save');
      }
      setLinks(withKeys(data.data));
      setSaved(data.data);
      toast('Social links saved — live on the site now');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <div className="space-y-3 p-5">
        {links.length === 0 && (
          <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            No social links. Add one to show icons in the footer and on the Contact page.
          </p>
        )}

        <ul className="space-y-2">
          {links.map((link, index) => {
            const platform = SOCIAL_PLATFORMS[link.platform];
            const error = errors[index];
            const id = `social-${link._key}`;
            return (
              <li
                key={link._key}
                className={cn('rounded-md border p-3', error ? 'border-danger/50' : 'border-border', !link.visible && 'bg-surface')}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'grid size-10 shrink-0 place-items-center rounded-md border border-border',
                        link.visible ? 'text-foreground' : 'text-muted/60'
                      )}
                      aria-hidden="true"
                    >
                      <Icon name={link.platform} className="size-[18px]" />
                    </span>
                    <Select
                      value={link.platform}
                      onChange={(e) => update(index, { platform: e.target.value })}
                      aria-label="Platform"
                      className="flex-1 sm:w-40 sm:flex-none"
                    >
                      {Object.entries(SOCIAL_PLATFORMS).map(([key, p]) => (
                        <option key={key} value={key}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Input
                    id={id}
                    type="url"
                    value={link.url}
                    onChange={(e) => update(index, { url: e.target.value })}
                    placeholder={platform?.placeholder}
                    aria-label={`${platform?.label || 'Link'} URL`}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    spellCheck={false}
                    className={cn('flex-1', !link.visible && 'text-muted')}
                  />
                  <div className="flex shrink-0 justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => update(index, { visible: !link.visible })}
                      aria-label={link.visible ? `Hide ${platform?.label}` : `Show ${platform?.label}`}
                      aria-pressed={!link.visible}
                      title={link.visible ? 'Visible on site — click to hide' : 'Hidden — click to show'}
                    >
                      {link.visible ? <Eye /> : <EyeOff />}
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(index, 1)}
                      disabled={index === links.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      aria-label={`Remove ${platform?.label}`}
                      className="hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                {error && (
                  <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-danger">
                    {error}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <Button variant="secondary" size="sm" onClick={add} disabled={links.length >= MAX_SOCIAL_LINKS}>
          <Plus />
          Add link
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-5 py-3">
        <p className="text-xs text-muted">Shown in the footer and on the Contact page, in this order.</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!dirty || saving}
            onClick={() => {
              setLinks(withKeys(saved));
              setErrors({});
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={!dirty || saving}>
            {saving && <Loader2 className="animate-spin" />}
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}
