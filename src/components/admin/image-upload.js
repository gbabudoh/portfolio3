'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';

const MAX_BYTES = 10 * 1024 * 1024;

export function ImageUpload({ value, onChange, folder = 'portfolio' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function upload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.');
    if (file.size > MAX_BYTES) return setError('Images must be smaller than 10 MB.');

    setError('');
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', folder);
      const res = await fetch('/api/cloudinary/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      onChange({ url: data.data.secure_url, publicId: data.data.public_id });
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-border bg-subtle">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover preview" className="size-full object-cover object-top" />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
            Replace
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onChange({ url: '', publicId: '' })}>
            <Trash2 />
            Remove
          </Button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
        {error && <p className="text-xs text-danger" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
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
          'flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm transition-colors',
          dragging ? 'border-accent bg-accent-soft' : 'border-input/60 hover:border-input hover:bg-subtle'
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-muted" aria-hidden="true" />
        ) : (
          <ImagePlus className="size-6 text-muted" aria-hidden="true" />
        )}
        <span className="font-medium">{uploading ? 'Uploading…' : 'Click or drop an image'}</span>
        <span className="text-xs text-muted">PNG, JPG or WebP · up to 10 MB · 16:9 works best</span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
      {error && <p className="text-xs text-danger" role="alert">{error}</p>}
    </div>
  );
}
