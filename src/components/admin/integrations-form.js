'use client';

import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { api, useToast } from '@/components/admin/ui';

const FIELDS = [
  {
    key: 'ga_measurement_id',
    label: 'Google Analytics 4 — Measurement ID',
    placeholder: 'G-XXXXXXXXXX',
    help: 'GA → Admin → Data streams → your web stream. You can paste the ID or the whole gtag snippet.',
    link: 'https://analytics.google.com/',
  },
  {
    key: 'clarity_project_id',
    label: 'Microsoft Clarity — Project ID',
    placeholder: 'e.g. ytkd0tb8bx',
    help: 'Clarity → Settings → Setup. You can paste the ID or the whole tracking snippet.',
    link: 'https://clarity.microsoft.com/',
  },
];

export function IntegrationsForm({ initial }) {
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const dirty = FIELDS.some((f) => (values[f.key] || '') !== (saved[f.key] || ''));

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.error || 'Failed to save');
      }
      // Show the cleaned-up IDs (e.g. extracted from a pasted snippet).
      setValues(data.data);
      setSaved(data.data);
      toast('Tracking settings saved — live on the next page load');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-5 p-5">
        {FIELDS.map((field) => {
          const id = `integration-${field.key}`;
          const active = Boolean(saved[field.key]);
          return (
            <div key={field.key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium">{field.label}</label>
                <span className={active ? 'text-xs font-medium text-success' : 'text-xs text-muted'}>
                  {active ? '● Active' : 'Not connected'}
                </span>
              </div>
              <Input
                id={id}
                value={values[field.key] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={errors[field.key] ? 'true' : undefined}
                aria-describedby={`${id}-help`}
                className="font-mono"
              />
              <p id={`${id}-help`} className={errors[field.key] ? 'text-xs text-danger' : 'text-xs text-muted'}>
                {errors[field.key] || (
                  <>
                    {field.help}{' '}
                    <a href={field.link} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-0.5">
                      Open <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </>
                )}
              </p>
            </div>
          );
        })}
        <p className="rounded-md bg-subtle px-3 py-2.5 text-xs text-muted">
          Tags load on public pages only, in production builds. Admin pages are never tracked. Leave a field empty to disconnect it.
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-border bg-surface px-5 py-3">
        <Button type="button" variant="secondary" disabled={!dirty || saving} onClick={() => { setValues(saved); setErrors({}); }}>
          Reset
        </Button>
        <Button type="submit" disabled={!dirty || saving}>
          {saving && <Loader2 className="animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
