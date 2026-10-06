'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/field';
import { AdminPageHeader, Card, CardHeader, api, useToast } from '@/components/admin/ui';

// Where each section appears on the public About page.
const SECTIONS = [
  { key: 'main_description', name: 'Introduction', help: 'Lead paragraph under the About page title.', rows: 3, hideTitle: true },
  { key: 'experience_paragraph', name: 'Experience', help: 'First block in “How I work”.', rows: 5 },
  { key: 'specialization', name: 'Specialisation', help: 'Second block in “How I work”.', rows: 5 },
  { key: 'ai_integration', name: 'AI workflow', help: 'Third block in “How I work”.', rows: 5 },
];

export default function AboutAdminPage() {
  const toast = useToast();
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/api/about')
      .then(({ data }) => {
        const map = Object.fromEntries(
          SECTIONS.map(({ key, name }) => {
            const row = data.find((r) => r.section === key);
            return [key, { title: row?.title || name, content: row?.content || '' }];
          })
        );
        setValues(map);
        setSaved(map);
      })
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const changed = SECTIONS.filter(({ key }) => JSON.stringify(values[key]) !== JSON.stringify(saved[key]));

  const update = (key, field, value) => setValues((v) => ({ ...v, [key]: { ...v[key], [field]: value } }));

  async function save() {
    const invalid = changed.find(({ key }) => !values[key].content.trim());
    if (invalid) {
      toast(`${invalid.name} can’t be empty`, 'error');
      return;
    }
    setSaving(true);
    try {
      for (const { key } of changed) {
        await api('/api/about', { method: 'POST', body: { section: key, ...values[key] } });
      }
      setSaved(values);
      toast(changed.length === 1 ? 'Section saved' : `${changed.length} sections saved`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="About"
        description="Narrative copy for the About page."
        actions={
          <>
            <ButtonLink href="/about" external variant="secondary">
              Preview
              <ExternalLink />
            </ButtonLink>
            <Button onClick={save} disabled={saving || changed.length === 0}>
              {saving && <Loader2 className="animate-spin" />}
              {changed.length > 0 ? `Save ${changed.length} change${changed.length > 1 ? 's' : ''}` : 'Saved'}
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        {SECTIONS.map((section) => {
          const value = values[section.key];
          const isChanged = changed.some((c) => c.key === section.key);
          return (
            <Card key={section.key}>
              <CardHeader
                title={section.name}
                description={section.help}
                action={isChanged && <span className="text-xs font-medium text-warning">Unsaved</span>}
              />
              <div className="space-y-4 p-5">
                {loading || !value ? (
                  <div className="space-y-3">
                    <div className="skeleton h-10" />
                    <div className="skeleton h-24" />
                  </div>
                ) : (
                  <>
                    {!section.hideTitle && (
                    <div className="space-y-1.5">
                      <label htmlFor={`${section.key}-title`} className="text-sm font-medium">Heading</label>
                      <Input
                        id={`${section.key}-title`}
                        value={value.title}
                        onChange={(e) => update(section.key, 'title', e.target.value)}
                      />
                    </div>
                    )}
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <label htmlFor={`${section.key}-content`} className="text-sm font-medium">Content</label>
                        <span className="font-mono text-xs text-muted">{value.content.length} chars</span>
                      </div>
                      <Textarea
                        id={`${section.key}-content`}
                        rows={section.rows}
                        value={value.content}
                        onChange={(e) => update(section.key, 'content', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
