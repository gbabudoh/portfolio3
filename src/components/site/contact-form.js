'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';

const EMPTY = { name: '', email: '', subject: '', message: '', company: '' };

export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  const update = (event) => setValues((v) => ({ ...v, [event.target.name]: event.target.value }));

  async function onSubmit(event) {
    event.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Something went wrong.');
      setValues(EMPTY);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-lg border border-border p-8">
        <span className="grid size-10 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg">Message sent</h2>
          <p className="text-muted">Thanks for reaching out — I&apos;ll get back to you shortly.</p>
        </div>
        <Button variant="secondary" onClick={() => setStatus('idle')}>
          Send another message
        </Button>
      </div>
    );
  }

  const submitting = status === 'submitting';

  return (
    <form onSubmit={onSubmit} className="relative space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" autoComplete="name" required maxLength={120} value={values.name} onChange={update} />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" autoComplete="email" required maxLength={200} value={values.email} onChange={update} />
        </Field>
      </div>
      <Field label="Subject" htmlFor="subject" required>
        <Input id="subject" name="subject" required maxLength={200} value={values.subject} onChange={update} placeholder="e.g. New SaaS platform" />
      </Field>
      <Field label="Message" htmlFor="message" required hint="A few lines on goals, timeline and budget helps a lot.">
        <Textarea id="message" name="message" required rows={6} maxLength={5000} value={values.message} onChange={update} />
      </Field>

      {/* Honeypot: hidden from people, often filled in by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={update} />
      </div>

      {status === 'error' && (
        <p role="alert" className="flex items-center gap-2 rounded-md bg-danger/10 px-3 py-2.5 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? <Loader2 className="animate-spin" /> : <Send />}
        {submitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
