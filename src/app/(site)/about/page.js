import { ArrowRight } from 'lucide-react';
import { formatMonth, getAbout, getExperience, getSkillGroups, getStats } from '@/lib/content';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { CtaBand, PageHeader, Section, SectionHeader, StatStrip } from '@/components/site/blocks';

export const revalidate = 3600;

export const metadata = {
  title: 'About',
  description: 'Background, experience and technical expertise across web, mobile, cloud and AI engineering.',
  alternates: { canonical: '/about' },
};

const STORY_SECTIONS = ['experience_paragraph', 'specialization', 'ai_integration'];

export default function AboutPage() {
  const about = getAbout();
  const experience = getExperience();
  const skillGroups = getSkillGroups();
  const stats = getStats();

  const story = STORY_SECTIONS.map((key) => about[key]).filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Product-minded engineering, end to end."
        description={about.main_description?.content}
      >
        <div className="flex flex-col gap-3 pt-3 sm:flex-row">
          <ButtonLink href="/contact" size="lg">
            Work with me
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/work" size="lg" variant="secondary">
            See projects
          </ButtonLink>
        </div>
      </PageHeader>

      {/* Story */}
      {story.length > 0 && (
        <Section>
          <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
            <div className="space-y-3">
              <p className="eyebrow">Background</p>
              <h2 className="text-h2">How I work</h2>
            </div>
            <div className="space-y-10">
              {story.map((item) => (
                <div key={item.section} className="max-w-prose space-y-3">
                  {item.title && <h3 className="text-lg">{item.title}</h3>}
                  <p className="text-pretty leading-relaxed text-muted sm:text-lg">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-16">
            <StatStrip stats={stats} />
          </div>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section id="experience" className="border-t border-border">
          <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
            <div className="space-y-3">
              <p className="eyebrow">Experience</p>
              <h2 className="text-h2">Where I&apos;ve delivered</h2>
            </div>
            <ol className="space-y-0">
              {experience.map((item) => (
                <li key={item.id} className="grid gap-3 border-t border-border py-8 first:border-t-0 first:pt-0 sm:grid-cols-[160px_1fr] sm:gap-8">
                  <p className="font-mono text-sm text-muted">
                    {formatMonth(item.start)} — {item.current ? 'Present' : formatMonth(item.end)}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg">{item.role}</h3>
                      <p className="text-muted">{item.company}</p>
                    </div>
                    <p className="text-pretty text-muted">{item.summary}</p>
                    {item.highlights.length > 0 && (
                      <ul className="space-y-1.5">
                        {item.highlights.map((h) => (
                          <li key={h} className="flex gap-3 text-sm">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.stack.length > 0 && (
                      <ul className="flex flex-wrap gap-1.5 pt-1" aria-label="Technologies">
                        {item.stack.map((tech) => (
                          <li key={tech}>
                            <Badge tone="outline">{tech}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <div key={group.name} className="space-y-4 rounded-lg border border-border bg-background p-6">
                <h3 className="text-base">{group.name}</h3>
                <ul className="divide-y divide-border">
                  {group.skills.map((skill) => {
                    // Entries are usually "Label: item, item"; show the label as a row heading.
                    const split = skill.indexOf(':');
                    const label = split > 0 ? skill.slice(0, split).trim() : null;
                    const items = split > 0 ? skill.slice(split + 1).trim() : skill;
                    return (
                      <li key={skill} className="py-2.5 text-sm first:pt-0 last:pb-0">
                        {label && <span className="block font-medium">{label}</span>}
                        <span className={label ? 'text-muted' : ''}>{items}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      <CtaBand />
    </>
  );
}
