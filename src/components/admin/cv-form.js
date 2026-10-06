'use client';

import { useRef, useState } from 'react';
import { Copy, ExternalLink, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { Button, ButtonLink } from '@/components/ui/button';
import { api, useConfirm, useToast } from '@/components/admin/ui';

const MAX_BYTES = 5 * 1024 * 1024;

function formatBytes(bytes) {
  if (!bytes) return '';
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function CvForm({ initial }) {
  const toast = useToast();
  const confirm = useConfirm();
  const inputRef = useRef(null);
  const [cv, setCv] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  async function upload(file) {
    if (!file) return;
    setError('');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return setError('Please choose a PDF file.');
    if (file.size > MAX_BYTES) return setError('The PDF must be 5 MB or smaller.');

    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/cv', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      setCv(data.data);
      toast(cv ? 'CV replaced — the site now serves the new version' : 'CV uploaded — the CV button is now live');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function remove() {
    const ok = await confirm({
      title: 'Remove CV?',
      description: 'The CV button will disappear from the site and the /cv link will stop working.',
      confirmLabel: 'Remove',
    });
    if (!ok) return;
    try {
      await api('/api/cv', { method: 'DELETE' });
      setCv(null);
      toast('CV removed');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/cv`);
      toast('Link copied');
    } catch {
      toast('Couldn’t copy the link', 'error');
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      aria-label="Choose CV PDF"
      onChange={(e) => upload(e.target.files?.[0])}
    />
  );

  return (
    <div className="space-y-4 p-5">
      {cv ? (
        <div className="flex flex-col gap-4 rounded-md border border-border p-4 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-danger/10 text-danger">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium">CV.pdf · {formatBytes(cv.bytes)}</p>
            <p className="text-xs text-muted">
              Uploaded {formatDateTime(cv.uploadedAt)} · opened {cv.downloads} {cv.downloads === 1 ? 'time' : 'times'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/cv" external variant="secondary" size="sm">
              <ExternalLink />
              View
            </ButtonLink>
            <Button variant="secondary" size="sm" onClick={copyLink}>
              <Copy />
              Copy link
            </Button>
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
              Replace
            </Button>
            <Button variant="ghost" size="sm" onClick={remove} className="hover:bg-danger/10 hover:text-danger">
              <Trash2 />
              Remove
            </Button>
          </div>
          {fileInput}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              upload(e.dataTransfer.files?.[0]);
            }}
            disabled={uploading}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-10 text-sm transition-colors',
              dragging ? 'border-accent bg-accent-soft' : 'border-input/60 hover:border-input hover:bg-subtle'
            )}
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin text-muted" aria-hidden="true" />
            ) : (
              <UploadCloud className="size-6 text-muted" aria-hidden="true" />
            )}
            <span className="font-medium">{uploading ? 'Uploading…' : 'Click or drop your CV here'}</span>
            <span className="text-xs text-muted">PDF only · up to 5 MB</span>
          </button>
          {fileInput}
        </>
      )}

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      <p className="rounded-md bg-subtle px-3 py-2.5 text-xs text-muted">
        The CV button appears in the site navigation only while a CV is uploaded. Share the permanent link{' '}
        <span className="font-mono text-foreground">/cv</span> — it always serves your latest version. Tip: leave your
        home address off the public copy.
      </p>
    </div>
  );
}
