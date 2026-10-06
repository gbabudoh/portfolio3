'use client';

import { History } from 'lucide-react';
import { formatMonth } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { ResourceManager } from '@/components/admin/resource-manager';

const FIELDS = [
  { name: 'position', type: 'text', label: 'Role', required: true, span: 1 },
  { name: 'company', type: 'text', label: 'Company', required: true, span: 1 },
  { name: 'start_date', type: 'month', label: 'Start', required: true, span: 1 },
  { name: 'end_date', type: 'month', label: 'End', span: 1, showIf: (v) => !v.current },
  { name: 'current', type: 'switch', label: 'I currently work here' },
  { name: 'description', type: 'textarea', label: 'Summary', required: true, rows: 3 },
  { name: 'achievements', type: 'textarea', label: 'Highlights', rows: 4, hint: 'One per line. Lead with measurable outcomes.' },
  { name: 'technologies', type: 'text', label: 'Stack', hint: 'Comma-separated.' },
];

const DEFAULTS = {
  position: '', company: '', start_date: '', end_date: '', current: false,
  description: '', achievements: '', technologies: '',
};

export default function ExperienceAdminPage() {
  return (
    <ResourceManager
      endpoint="/api/experience"
      title="Experience"
      description="Roles shown in the timeline on the About page."
      singular="role"
      emptyIcon={History}
      fields={FIELDS}
      defaults={DEFAULTS}
      searchKeys={['position', 'company', 'technologies']}
      toForm={(row) => ({ ...row, current: Boolean(row.current), end_date: row.end_date || '' })}
      toPayload={(v) => ({ ...v, end_date: v.current ? null : v.end_date || null })}
      primary={(row) => ({
        title: row.position,
        subtitle: row.company,
        badge: row.current ? <Badge tone="success">Current</Badge> : null,
      })}
      columns={[
        {
          label: 'Dates',
          className: 'w-44 text-right font-mono text-xs',
          render: (row) => `${formatMonth(row.start_date)} — ${row.current ? 'Present' : formatMonth(row.end_date)}`,
        },
      ]}
    />
  );
}
