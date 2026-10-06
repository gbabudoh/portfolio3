'use client';

import { BarChart3 } from 'lucide-react';
import { ResourceManager } from '@/components/admin/resource-manager';

const FIELDS = [
  { name: 'value', type: 'text', label: 'Value', required: true, placeholder: '6+', span: 1 },
  { name: 'label', type: 'text', label: 'Label', required: true, placeholder: 'Years experience', span: 1 },
  { name: 'key', type: 'text', label: 'Key', required: true, hint: 'Unique identifier. Use “production_projects” to auto-count projects.', span: 1 },
  { name: 'display_order', type: 'number', label: 'Display order', min: 0, span: 1, hint: 'Lower numbers show first. The site shows the first four.' },
];

export default function StatsAdminPage() {
  return (
    <ResourceManager
      endpoint="/api/stats"
      title="Stats"
      description="Headline numbers shown in the proof strip on the Home and About pages."
      singular="stat"
      emptyIcon={BarChart3}
      fields={FIELDS}
      defaults={{ key: '', value: '', label: '', display_order: '0', color: 'blue' }}
      searchKeys={['label', 'key', 'value']}
      sort={(a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)}
      toForm={(row) => ({ ...row, display_order: String(row.display_order ?? 0) })}
      toPayload={(v) => ({ ...v, display_order: Number(v.display_order) || 0, color: v.color || 'blue' })}
      primary={(row) => ({
        title: row.label,
        subtitle: row.key === 'production_projects' ? `${row.key} · auto-counted from projects` : row.key,
      })}
      columns={[
        { label: 'Value', className: 'w-24 text-right text-lg font-semibold text-foreground', render: (row) => row.value },
        { label: 'Order', className: 'w-12 text-right font-mono text-xs', render: (row) => `#${row.display_order}` },
      ]}
    />
  );
}
