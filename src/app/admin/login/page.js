'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { site } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function safeNext() {
  const next = new URLSearchParams(window.location.search).get('next');
  // Only allow internal admin paths to prevent open redirects.
  return next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin';
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Sign in failed');
      // Full navigation so the new cookie is sent with the next server request.
      window.location.assign(safeNext());
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to site
        </Link>
        <ThemeToggle className="size-8" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 space-y-4 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-lg bg-foreground font-mono font-semibold text-background">
              {site.name.charAt(0)}
            </span>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">Sign in to admin</h1>
              <p className="text-sm text-muted">Manage your portfolio content</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-border bg-background p-6 shadow-sm">
            <Field label="Username" htmlFor="username">
              <Input
                id="username"
                autoComplete="username"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>
            <Field label="Password" htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-md text-muted hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2.5 text-sm text-danger">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Lock />}
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
