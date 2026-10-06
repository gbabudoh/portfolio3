// Server-side read model for the public site. Pages call these directly
// (React Server Components) instead of fetching our own API over HTTP.
import { getDatabase } from '@/lib/database';

export { formatMonth } from '@/lib/format';

export function splitList(value) {
  if (!value) return [];
  return String(value)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toProject(row) {
  return {
    id: row.id,
    slug: slugify(row.title) || String(row.id),
    title: row.title,
    summary: row.description,
    body: row.long_description || '',
    image: row.image_url || null,
    liveUrl: row.live_url || null,
    repoUrl: row.github_url || null,
    category: row.category,
    featured: Boolean(row.featured),
    stack: splitList(row.technologies),
    practices: splitList(row.technical_skills),
    createdAt: row.created_at,
  };
}

export function getProjects() {
  const rows = getDatabase()
    .prepare('SELECT * FROM projects ORDER BY featured DESC, created_at DESC, id DESC')
    .all();
  return rows.map(toProject);
}

export function getFeaturedProjects(limit = 3) {
  return getProjects().slice(0, limit);
}

export function getProjectBySlug(slug) {
  return getProjects().find((p) => p.slug === slug) || null;
}

export function getAdjacentProject(slug) {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1 || projects.length < 2) return null;
  return projects[(index + 1) % projects.length];
}

export function getStats() {
  const db = getDatabase();
  const stats = db.prepare('SELECT * FROM stats ORDER BY display_order ASC, id ASC').all();
  const projectCount = db.prepare('SELECT COUNT(*) AS n FROM projects').get().n;
  // "production_projects" is derived from the projects table so it never goes stale.
  return stats.map((s) => ({
    id: s.id,
    key: s.key,
    label: s.label,
    value: s.key === 'production_projects' && projectCount > 0 ? `${projectCount}+` : s.value,
  }));
}

export function getAbout() {
  const rows = getDatabase().prepare('SELECT section, title, content FROM about_content').all();
  return Object.fromEntries(rows.map((r) => [r.section, r]));
}

export function getExperience() {
  const rows = getDatabase()
    .prepare('SELECT * FROM experience ORDER BY current DESC, start_date DESC, id ASC')
    .all();
  return rows.map((row) => ({
    id: row.id,
    company: row.company,
    role: row.position,
    summary: row.description,
    start: row.start_date,
    end: row.end_date,
    current: Boolean(row.current),
    stack: splitList(row.technologies),
    highlights: String(row.achievements || '')
      .split('\n')
      .map((s) => s.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean),
  }));
}

// Skill categories have drifted over time (e.g. "Specialized" vs "Specialised").
// Collapse them into a small set of domains so the About page stays scannable.
const SKILL_DOMAINS = [
  { name: 'Frontend & Design', match: ['Frontend', 'Styling', 'Ideation & Design', 'Languages'] },
  { name: 'Mobile', match: ['Mobile'] },
  { name: 'Backend & APIs', match: ['Backend', 'APIs & Communication', 'Database'] },
  { name: 'Cloud, DevOps & Security', match: ['Infrastructure (DevOps)', 'Security', 'Version Control & Collaboration'] },
  { name: 'Quality & Performance', match: ['Testing (QA)', 'Performance & SEO', 'Performance & SEO Optimization'] },
  { name: 'AI Engineering', match: ['AI & LLM Engineering', 'Development Environment & AI Workflow'] },
];

export function getSkillGroups() {
  const skills = getDatabase()
    .prepare('SELECT name, category FROM skills ORDER BY proficiency DESC, name ASC')
    .all();

  const groups = SKILL_DOMAINS.map((d) => ({ name: d.name, skills: [] }));
  const other = { name: 'Specialised', skills: [] };

  for (const skill of skills) {
    const index = SKILL_DOMAINS.findIndex((d) => d.match.includes(skill.category));
    (index === -1 ? other : groups[index]).skills.push(skill.name);
  }

  return [...groups, other]
    .filter((g) => g.skills.length > 0)
    .map((g) => {
      const entries = g.skills.map(parseSkillEntry);
      return {
        name: g.name,
        id: slugify(g.name),
        entries,
        count: entries.reduce((n, e) => n + e.items.length, 0),
      };
    });
}

// "Frameworks: Express, Django (Python), .NET (C#)" -> { label, items[] }.
// Splits on commas that aren't inside parentheses and drops trailing full stops.
function parseSkillEntry(text) {
  const split = text.indexOf(':');
  const label = split > 0 ? text.slice(0, split).trim() : null;
  const rest = split > 0 ? text.slice(split + 1) : text;
  const items = rest
    .split(/,(?![^(]*\))/)
    .map((item) => item.trim().replace(/\.$/, ''))
    .filter(Boolean);
  return { label, items };
}
