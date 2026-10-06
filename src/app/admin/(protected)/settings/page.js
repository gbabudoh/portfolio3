import { CheckCircle2, XCircle } from 'lucide-react';
import { getAdminCredentials, getSession } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { mainNav, site } from '@/lib/site';
import { getCv, getIntegrationSettings } from '@/lib/settings';
import { AdminPageHeader, Card, CardHeader } from '@/components/admin/primitives';
import { IntegrationsForm } from '@/components/admin/integrations-form';
import { CvForm } from '@/components/admin/cv-form';

export const metadata = { title: 'Settings' };

function Row({ label, children }) {
  return (
    <div className="grid gap-1 px-5 py-3.5 text-sm sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function Check({ ok, label, help }) {
  const StatusIcon = ok ? CheckCircle2 : XCircle;
  return (
    <li className="flex gap-3 px-5 py-3.5">
      <StatusIcon className={ok ? 'mt-0.5 size-4 shrink-0 text-success' : 'mt-0.5 size-4 shrink-0 text-danger'} aria-hidden="true" />
      <div className="space-y-0.5 text-sm">
        <p className="font-medium">
          {label}
          <span className="sr-only">{ok ? ' — passing' : ' — needs attention'}</span>
        </p>
        <p className="text-xs text-muted">{help}</p>
      </div>
    </li>
  );
}

export default async function SettingsPage() {
  const session = await getSession();
  const credentials = getAdminCredentials();
  const secret = process.env.SESSION_SECRET || '';
  const integrations = getIntegrationSettings();
  const cv = getCv();

  const checks = [
    {
      ok: !credentials.usingDefaultPassword,
      label: 'Custom admin password',
      help: 'Set ADMIN_PASSWORD in the environment. The built-in default is rejected in production.',
    },
    {
      ok: secret.length >= 32,
      label: 'Session signing secret',
      help: 'Set SESSION_SECRET to 32+ random characters. Required in production.',
    },
    {
      ok: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      label: 'Image uploads (Cloudinary)',
      help: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
    },
  ];

  return (
    <>
      <AdminPageHeader title="Settings" description="Account, security and site configuration." />

      <div className="space-y-4">
        <Card>
          <CardHeader title="Account" />
          <dl className="divide-y divide-border">
            <Row label="Username">{session?.username}</Row>
            <Row label="Session expires">{session ? formatDateTime(session.expiresAt) : '—'}</Row>
          </dl>
        </Card>

        <Card>
          <CardHeader title="CV" description="Upload a PDF to show a “CV” button in the site navigation." />
          <CvForm initial={cv} />
        </Card>

        <Card>
          <CardHeader title="Analytics & tracking" description="Connect Google Analytics and Microsoft Clarity to the public site." />
          <IntegrationsForm initial={integrations} />
        </Card>

        <Card>
          <CardHeader title="Security checklist" description="Environment configuration for a production-ready deployment." />
          <ul className="divide-y divide-border">
            {checks.map((check) => (
              <Check key={check.label} {...check} />
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Site identity" description="Edit in src/lib/site.js — used across pages, metadata and structured data." />
          <dl className="divide-y divide-border">
            <Row label="Name">{site.name}</Row>
            <Row label="Role">{site.role}</Row>
            <Row label="Canonical URL">{site.url}</Row>
            <Row label="Contact email">{site.email}</Row>
            <Row label="Location">{site.location}</Row>
            <Row label="Availability">{site.availability}</Row>
            <Row label="Navigation">{mainNav.map((n) => n.label).join(' · ')}</Row>
          </dl>
        </Card>
      </div>
    </>
  );
}
