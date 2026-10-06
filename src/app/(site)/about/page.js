import { ArrowRight, Compass, Layers, Sparkles } from 'lucide-react';
import { getAbout, getSkillGroups, getStats } from '@/lib/content';
import { site } from '@/lib/site';
import { ButtonLink } from '@/components/ui/button';
import { CtaBand, PageHeader, Section, SectionHeader } from '@/components/site/blocks';
import { SkillsExplorer } from '@/components/site/skills-explorer';

export const revalidate = 3600;

export const metadata = {
  title: 'About',
  description: 'Background, experience and technical expertise across web, mobile, cloud and AI engineering.',
  alternates: { canonical: '/about' },
};

const STORY_SECTIONS = ['experience_paragraph', 'specialization', 'ai_integration'];

const PILLAR_ICONS = {
  experience_paragraph: Layers,
  specialization: Compass,
  ai_integration: Sparkles,
};

export default function AboutPage() {
  const about = getAbout();
  const skillGroups = getSkillGroups();
  const stats = getStats();

  // Only verifiable proof points; vanity metrics are intentionally excluded.
  const statByKey = Object.fromEntries(stats.map((s) => [s.key, s.value]));
  const proof = [
    statByKey.years_experience && `${statByKey.years_experience} yrs`,
    statByKey.production_projects && `${statByKey.production_projects} projects shipped`,
  ].filter(Boolean);

  const story = STORY_SECTIONS.map((key) => about[key]).filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Product-minded engineering, end to end."
        description={about.main_description?.content}
      >
        {/* Identity: puts a person behind the page */}
        <div className="flex items-center gap-4 pt-1">
          <span
            className="relative grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-text text-xl font-semibold text-accent-foreground shadow-sm ring-4 ring-accent-soft"
            aria-hidden="true"
          >
            {site.name.charAt(0)}
            <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-background bg-success" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold leading-tight">{site.fullName}</p>
            <p className="text-sm text-muted">{site.role}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium">
              {proof.map((item) => (
                <span key={item} className="text-foreground after:ml-2 after:text-muted after:content-['·']">
                  {item}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-success">
                <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                {site.availability}
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-3 pt-2 sm:flex">
          <ButtonLink href="/contact" size="lg">
            Work with me
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/work" size="lg" variant="secondary">
            See projects
          </ButtonLink>
        </div>
      </PageHeader>

      {/* What I bring — three pillars as a scannable card grid */}
      {story.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow="Background"
            title="What I bring"
            description="Three strengths that shape every engagement, from first architecture decision to launch."
          />
          <ul className="grid gap-4 md:grid-cols-3">
            {story.map((item) => {
              const PillarIcon = PILLAR_ICONS[item.section] || Layers;
              return (
                <li
                  key={item.section}
                  className="flex flex-col gap-4 rounded-lg border border-border bg-background p-6 transition-colors hover:border-foreground/20 sm:p-7"
                >
                  <span className="grid size-10 place-items-center rounded-md bg-accent-soft text-accent-text">
                    <PillarIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div className="space-y-2">
                    {item.title && <h3 className="text-lg leading-snug">{item.title}</h3>}
                    <p className="text-pretty leading-relaxed text-muted">{item.content}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* Skills */}
      {skillGroups.length > 0 && (
        <Section id="skills" className="border-t border-border bg-surface">
          <SectionHeader
            eyebrow="Expertise"
            title="Technical toolkit"
            description="A production-grade stack spanning the interface, the API and the infrastructure underneath."
          />
          <SkillsExplorer groups={skillGroups} />
        </Section>
      )}

      <CtaBand />
    </>
  );
}
