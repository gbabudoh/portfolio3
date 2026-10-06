import { ArrowLeft } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="container flex min-h-[60vh] flex-col items-start justify-center gap-6 py-24">
      <p className="eyebrow">404</p>
      <h1 className="text-h1">This page doesn&apos;t exist.</h1>
      <p className="max-w-md text-muted">The link may be broken, or the page may have moved.</p>
      <ButtonLink href="/" variant="secondary">
        <ArrowLeft />
        Back home
      </ButtonLink>
    </section>
  );
}
