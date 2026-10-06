'use client';

import { Briefcase, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResourceManager } from '@/components/admin/resource-manager';

const CATEGORIES = [
  'Marketing & Content Platforms',
  'SaaS & Productivity',
  'Commerce & Marketplaces',
  'AI & Data Intelligence',
  'Interactive & Media',
  'Mobile Applications',
  'Design & Strategy Case Studies',
];

const FIELDS = [
  { name: 'cover', type: 'image', label: 'Cover image', urlKey: 'image_url', idKey: 'image_public_id', folder: 'portfolio/projects' },
  { name: 'title', type: 'text', label: 'Title', required: true },
  { name: 'category', type: 'select', label: 'Category', required: true, options: CATEGORIES, span: 1 },
  { name: 'featured', type: 'switch', label: 'Featured', hint: 'Featured projects appear first and on the home page.', span: 1 },
  { name: 'description', type: 'text', label: 'Summary', required: true, hint: 'One sentence shown on project cards.' },
  { name: 'long_description', type: 'textarea', label: 'Case study overview', rows: 7, hint: 'Problem, approach and outcome. Separate paragraphs with a blank line.' },
  { name: 'technologies', type: 'text', label: 'Stack', placeholder: 'Next.js, PostgreSQL, Stripe', hint: 'Comma-separated.' },
  { name: 'technical_skills', type: 'text', label: 'Engineering practices', placeholder: 'CI/CD pipelines, Load testing', hint: 'Comma-separated.' },
  { name: 'live_url', type: 'url', label: 'Live URL', placeholder: 'https://', span: 1 },
  { name: 'github_url', type: 'url', label: 'Repository URL', placeholder: 'https://', span: 1 },
];

const DEFAULTS = {
  title: '', category: '', featured: false, description: '', long_description: '',
  technologies: '', technical_skills: '', live_url: '', github_url: '', image_url: '', image_public_id: '',
};

export default function ProjectsAdminPage() {
  return (
    <ResourceManager
      endpoint="/api/projects"
      title="Projects"
      description="Case studies shown on the Work page. Featured projects lead the home page."
      singular="project"
      emptyIcon={Briefcase}
      sheetSize="lg"
      fields={FIELDS}
      defaults={DEFAULTS}
      searchKeys={['title', 'description', 'technologies', 'category']}
      filter={{ key: 'category', label: 'Categories' }}
      toForm={(row) => ({ ...row, featured: Boolean(row.featured) })}
      primary={(row) => ({
        title: row.title,
        subtitle: row.description,
        media: row.image_url || null,
        badge: row.featured ? <Badge tone="accent">Featured</Badge> : null,
      })}
      columns={[
        { label: 'Category', className: 'w-56 truncate text-xs', render: (row) => row.category },
        {
          label: 'Live',
          className: 'w-8',
          render: (row) =>
            row.live_url ? (
              <a
                href={row.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-8 place-items-center rounded-md hover:bg-subtle hover:text-foreground"
                aria-label={`Open ${row.title} live site`}
              >
                <ExternalLink className="size-4" />
              </a>
            ) : null,
        },
      ]}
    />
  );
}
