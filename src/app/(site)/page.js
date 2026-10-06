import { ArrowRight } from 'lucide-react';
import { capabilities, site } from '@/lib/site';
import { getFeaturedProjects, getStats } from '@/lib/content';
import { ButtonLink } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CtaBand, ProjectGrid, Section, SectionHeader, StatStrip } from '@/components/site/blocks';

export const revalidate = 3600;

export default function HomePage() {
  const projects = getFeaturedProjects(3);
  const stats = getStats();

  return (
    <>
      {/* Hero */}
      <section className="container pb-16 pt-8 sm:pb-20 sm:pt-12 lg:pt-16">
        <div className="max-w-4xl animate-fade-up space-y-6 sm:space-y-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-muted">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            {site.availability}
          </p>

          <h1 className="text-display">
            Engineering scalable products,{' '}
            <span className="text-muted">from architecture to launch.</span>
          </h1>

          <p className="max-w-2xl text-pretty text-lg text-muted sm:text-xl">{site.tagline}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/work" size="lg">
              View selected work
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Get in touch
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12 animate-fade-up [animation-delay:120ms] sm:mt-14">
          <StatStrip stats={stats} />
        </div>
      </section>

      {/* Selected work */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="Selected work"
          title="Recent projects"
          description="Production platforms delivered across content, commerce and mobile."
          action={
            <ButtonLink href="/work" variant="secondary" className="self-start md:self-auto">
              All projects
              <ArrowRight />
            </ButtonLink>
          }
        />
        <ProjectGrid projects={projects} priorityCount={0} />
      </Section>

      {/* Capabilities */}
      <Section className="border-t border-border bg-surface">
        <SectionHeader
          eyebrow="Capabilities"
          title="What I bring to a team"
          description="Senior ownership across the stack — from the first architecture decision to production monitoring."
        />
        <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => (
            <li key={item.title} className="space-y-3 bg-background p-6 sm:p-8">
              <span className="grid size-10 place-items-center rounded-md bg-accent-soft text-accent-text">
                <Icon name={item.icon} className="size-5" />
              </span>
              <h3 className="text-base">{item.title}</h3>
              <p className="text-sm text-muted">{item.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand />
    </>
  );
}
