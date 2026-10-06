import { getProjects } from '@/lib/content';
import { CtaBand, PageHeader, Section } from '@/components/site/blocks';
import { WorkBrowser } from '@/components/site/work-browser';

export const revalidate = 3600;

export const metadata = {
  title: 'Work',
  description: 'Selected production projects across SaaS, content platforms, commerce and mobile.',
  alternates: { canonical: '/work' },
};

export default function WorkPage() {
  const projects = getProjects();

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title="Selected projects"
        description="Production platforms I've designed, built and shipped — each with a short case study covering the problem, approach and stack."
      />
      <Section className="pt-12 sm:pt-16 lg:pt-16">
        <WorkBrowser projects={projects} />
      </Section>
      <CtaBand />
    </>
  );
}
