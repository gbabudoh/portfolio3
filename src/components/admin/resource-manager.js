'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/field';
import { ImageUpload } from '@/components/admin/image-upload';
import {
  AdminPageHeader,
  Card,
  EmptyState,
  SearchInput,
  Sheet,
  SkeletonRows,
  api,
  useConfirm,
  useToast,
} from '@/components/admin/ui';

/**
 * Config-driven list + create/edit/delete screen used by every content type,
 * so all admin sections share the same layout, behaviour and feedback.
 *
 * fields:  [{ name, label, type, required, options, hint, placeholder, span, showIf }]
 *          type: text | url | number | month | textarea | select | switch | image
 * columns: [{ label, render(row), className }] — secondary metadata (hidden on mobile)
 * primary(row): { title, subtitle, media? } — the main cell
 */
export function ResourceManager({
  endpoint,
  title,
  description,
  singular,
  fields,
  columns = [],
  primary,
  searchKeys = [],
  filter,
  defaults = {},
  toForm = (row) => row,
  toPayload = (values) => values,
  sort,
  sheetSize = 'md',
  emptyIcon,
}) {
  const toast = useToast();
  const confirm = useConfirm();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const [editing, setEditing] = useState(null); // null | 'new' | row
  const [values, setValues] = useState(defaults);
  const [initial, setInitial] = useState(defaults);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api(endpoint);
      setRows(sort ? [...data].sort(sort) : data);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  // Deep link: /admin/<resource>?new=1 opens the create panel (used by dashboard shortcuts).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') {
      openEditor('new');
      window.history.replaceState(null, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterOptions = useMemo(() => {
    if (!filter) return [];
    return [...new Set(rows.map((r) => r[filter.key]).filter(Boolean))].sort();
  }, [rows, filter]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter && filterValue && row[filter.key] !== filterValue) return false;
      if (!q) return true;
      return searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q));
    });
  }, [rows, query, filter, filterValue, searchKeys]);

  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  function openEditor(row) {
    const next = row === 'new' ? { ...defaults } : { ...defaults, ...toForm(row) };
    setValues(next);
    setInitial(next);
    setErrors({});
    setEditing(row);
  }

  async function closeEditor() {
    if (dirty && !saving) {
      const discard = await confirm({
        title: 'Discard unsaved changes?',
        description: 'You have edits that haven’t been saved. They will be lost.',
        confirmLabel: 'Discard',
      });
      if (!discard) return;
    }
    setEditing(null);
  }

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validate() {
    const next = {};
    for (const field of fields) {
      if (field.showIf && !field.showIf(values)) continue;
      const v = values[field.name];
      if (field.required && (v === undefined || v === null || String(v).trim() === '')) {
        next[field.name] = `${field.label} is required`;
      }
      if (field.type === 'url' && v && !/^https?:\/\//i.test(v)) {
        next[field.name] = 'Must start with http:// or https://';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save(event) {
    event?.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = toPayload(values);
      const isNew = editing === 'new';
      await api(isNew ? endpoint : `${endpoint}/${editing.id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: payload,
      });
      toast(`${capitalise(singular)} ${isNew ? 'created' : 'updated'}`);
      setInitial(values);
      setEditing(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    const label = primary(row).title;
    const ok = await confirm({
      title: `Delete ${singular}?`,
      description: `“${label}” will be permanently removed. This can’t be undone.`,
    });
    if (!ok) return;
    try {
      await api(`${endpoint}/${row.id}`, { method: 'DELETE' });
      setRows((r) => r.filter((x) => x.id !== row.id));
      toast(`${capitalise(singular)} deleted`);
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => openEditor('new')}>
            <Plus />
            New {singular}
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
          <SearchInput value={query} onChange={setQuery} placeholder={`Search ${title.toLowerCase()}…`} className="sm:max-w-xs sm:flex-1" />
          {filter && filterOptions.length > 1 && (
            <Select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              aria-label={`Filter by ${filter.label}`}
              className="h-9 sm:w-56"
            >
              <option value="">All {filter.label.toLowerCase()}</option>
              {filterOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </Select>
          )}
          <p className="text-xs text-muted sm:ml-auto">
            {loading ? 'Loading…' : `${visible.length} of ${rows.length}`}
          </p>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={rows.length === 0 ? `No ${title.toLowerCase()} yet` : 'No matches'}
            description={rows.length === 0 ? `Create your first ${singular} to get started.` : 'Try a different search or filter.'}
            action={
              rows.length === 0 && (
                <Button variant="secondary" size="sm" onClick={() => openEditor('new')}>
                  <Plus />
                  New {singular}
                </Button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((row) => {
              const p = primary(row);
              return (
                <li key={row.id} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface sm:px-5">
                  {p.media !== undefined && (
                    <div className="hidden size-12 shrink-0 overflow-hidden rounded-md border border-border bg-subtle sm:block">
                      {p.media && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.media} alt="" className="size-full object-cover object-top" loading="lazy" />
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => openEditor(row)}
                    className="min-w-0 flex-1 rounded text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{p.title}</span>
                      {p.badge}
                    </span>
                    {p.subtitle && <span className="mt-0.5 block truncate text-xs text-muted">{p.subtitle}</span>}
                  </button>
                  {columns.map((col) => (
                    <div key={col.label} className={cn('hidden shrink-0 text-sm text-muted md:block', col.className)}>
                      {col.render(row)}
                    </div>
                  ))}
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEditor(row)} aria-label={`Edit ${p.title}`}>
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(row)}
                      aria-label={`Delete ${p.title}`}
                      className="hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Sheet
        open={editing !== null}
        onClose={closeEditor}
        size={sheetSize}
        title={editing === 'new' ? `New ${singular}` : `Edit ${singular}`}
        description={
          editing === 'new' ? `Add a new ${singular} to your portfolio.` : editing ? primary(editing).title : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={closeEditor} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="resource-form" disabled={saving || (!dirty && editing !== 'new')}>
              {saving && <Loader2 className="animate-spin" />}
              {editing === 'new' ? `Create ${singular}` : 'Save changes'}
            </Button>
          </>
        }
      >
        <form id="resource-form" onSubmit={save} className="grid gap-5 sm:grid-cols-2" noValidate>
          {fields
            .filter((field) => !field.showIf || field.showIf(values))
            .map((field) => (
              <FormField key={field.name} field={field} values={values} error={errors[field.name]} onChange={setField} />
            ))}
        </form>
      </Sheet>
    </>
  );
}

function FormField({ field, values, error, onChange }) {
  const id = `field-${field.name}`;
  const value = values[field.name] ?? '';
  const span = field.span === 1 ? 'sm:col-span-1' : 'sm:col-span-2';
  const common = {
    id,
    name: field.name,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error || field.hint ? `${id}-help` : undefined,
    placeholder: field.placeholder,
  };

  if (field.type === 'switch') {
    return (
      <div className={span}>
        <Switch
          id={id}
          checked={Boolean(values[field.name])}
          onChange={(checked) => onChange(field.name, checked)}
          label={field.label}
          description={field.hint}
        />
      </div>
    );
  }

  if (field.type === 'image') {
    return (
      <Field label={field.label} hint={field.hint} error={error} className={span}>
        <ImageUpload
          value={values[field.urlKey]}
          folder={field.folder}
          onChange={({ url, publicId }) => {
            onChange(field.urlKey, url);
            onChange(field.idKey, publicId);
          }}
        />
      </Field>
    );
  }

  let control;
  if (field.type === 'textarea') {
    control = <Textarea {...common} rows={field.rows || 4} value={value} onChange={(e) => onChange(field.name, e.target.value)} />;
  } else if (field.type === 'select') {
    control = (
      <Select {...common} value={value} onChange={(e) => onChange(field.name, e.target.value)}>
        <option value="" disabled>Select…</option>
        {field.options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
        {/* Keep legacy values selectable even if they're no longer in the list */}
        {value && !field.options.some((o) => (typeof o === 'string' ? o : o.value) === value) && (
          <option value={value}>{value}</option>
        )}
      </Select>
    );
  } else {
    const type = { url: 'url', number: 'number', month: 'month' }[field.type] || 'text';
    control = (
      <Input
        {...common}
        type={type}
        min={field.min}
        max={field.max}
        value={value}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    );
  }

  return (
    <div className={cn('space-y-1.5', span)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      {control}
      {(error || field.hint) && (
        <p id={`${id}-help`} className={cn('text-xs', error ? 'text-danger' : 'text-muted')}>
          {error || field.hint}
        </p>
      )}
    </div>
  );
}

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
