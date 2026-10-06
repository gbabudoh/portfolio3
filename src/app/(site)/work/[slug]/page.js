import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from 'lucide-react';
import { getAdjacentProject, getProjectBySlug, getProjects } from '@/lib/content';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { CtaBand, ProjectImage } from '@/components/site/blocks';

export const revalidate = 3600;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      images: project.image ? [{ url: project.image }] : undefined,
    },
  };
}

function MetaRow({ label, children }) {
  return (
    <div className="space-y-1.5 border-t border-border py-4 first:border-t-0 first:pt-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const next = getAdjacentProject(slug);
  const paragraphs = (project.body || project.summary).split(/\r?\n\s*\r?\n/).filter(Boolean);

  return (
    <article>
      <header className="container pb-10 pt-10 sm:pt-14">
        <Link
          href="/work"
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All work
        </Link>

        <div className="max-w-3xl animate-fade-up space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{project.category}</Badge>
            {project.featured && <Badge tone="accent">Featured</Badge>}
          </div>
          <h1 className="text-h1">{project.title}</h1>
          <p className="text-pretty text-lg text-muted sm:text-xl">{project.summary}</p>
          {(project.liveUrl || project.repoUrl) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {project.liveUrl && (
                <ButtonLink href={project.liveUrl} external>
                  Visit live site
                  <ArrowUpRight />
                </ButtonLink>
              )}
              {project.repoUrl && (
                <ButtonLink href={project.repoUrl} external variant="secondary">
                  <Github />
                  Source code
                </ButtonLink>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="container">
        <ProjectImage
          src={project.image}
          alt={`${project.title} screenshot`}
          priority
          sizes="(min-width: 1200px) 1136px, 100vw"
          className="aspect-[16/9] rounded-xl border border-border"
        />
      </div>

      <div className="container grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_280px] lg:gap-20">
        <div className="max-w-prose space-y-6">
          <h2 className="text-h2">Overview</h2>
          {paragraphs.map((text, i) => (
            <p key={i} className="text-pretty leading-relaxed text-muted sm:text-lg">
              {text}
            </p>
          ))}

          {project.practices.length > 0 && (
            <div className="space-y-4 pt-6">
              <h2 className="text-h2">Engineering practices</h2>
              <ul className="space-y-2">
                {project.practices.map((item) => (
                  <li key={item} className="flex gap-3 text-muted">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside aria-label="Project details" className="lg:sticky lg:top-24 lg:self-start">
          <dl className="rounded-lg border border-border p-5">
            <MetaRow label="Category">{project.category}</MetaRow>
            {project.stack.length > 0 && (
              <MetaRow label="Stack">
                <ul className="flex flex-wrap gap-1.5 pt-1">
                  {project.stack.map((tech) => (
                    <li key={tech}>
                      <Badge tone="outline">{tech}</Badge>
                    </li>
                  ))}
                </ul>
              </MetaRow>
            )}
            {project.liveUrl && (
              <MetaRow label="Live">
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="link break-all">
                  {project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </MetaRow>
            )}
          </dl>
        </aside>
      </div>

      {next && (
        <div className="border-t border-border">
          <Link
            href={`/work/${next.slug}`}
            className="group container flex items-center justify-between gap-6 py-10 sm:py-14"
          >
            <span className="space-y-1">
              <span className="eyebrow block">Next project</span>
              <span className="block text-h2">{next.title}</span>
            </span>
            <ArrowRight
              className="size-6 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-foreground"
              aria-hidden="true"
            />
          </Link>
        </div>
      )}

      <CtaBand />
    </article>
  );
}
