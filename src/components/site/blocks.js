import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ImageOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';

export function Section({ className, children, ...props }) {
  return (
    <section className={cn('py-14 sm:py-24 lg:py-28', className)} {...props}>
      <div className="container">{children}</div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description, action, className }) {
  return (
    <div className={cn('mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl space-y-3">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="text-h2">{title}</h2>
        {description && <p className="text-pretty text-muted sm:text-lg">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="border-b border-border">
      <div className="container py-12 sm:py-20 lg:py-24">
        <div className="max-w-3xl animate-fade-up space-y-5">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="text-h1">{title}</h1>
          {description && <p className="text-pretty text-lg text-muted sm:text-xl">{description}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

const CLOUDINARY_HOST = 'res.cloudinary.com';

export function ProjectImage({ src, alt, priority, sizes, className }) {
  if (!src) {
    return (
      <div className={cn('grid place-items-center bg-subtle text-muted', className)}>
        <ImageOff className="size-6" aria-hidden="true" />
      </div>
    );
  }

  let optimizable = false;
  try {
    optimizable = new URL(src).hostname === CLOUDINARY_HOST;
  } catch {}

  return (
    <div className={cn('relative overflow-hidden bg-subtle', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={!optimizable}
        className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
      />
    </div>
  );
}

export function ProjectCard({ project, priority = false }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-foreground/20">
      <ProjectImage
        src={project.image}
        alt=""
        priority={priority}
        sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
        className="aspect-[16/10] border-b border-border"
      />
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted">{project.category}</span>
          {project.featured && <Badge tone="accent">Featured</Badge>}
        </div>
        <h3 className="text-lg leading-snug">
          <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {project.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{project.summary}</p>
        {project.stack.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Technologies">
            {project.stack.slice(0, 3).map((tech) => (
              <li key={tech}>
                <Badge tone="outline">{tech}</Badge>
              </li>
            ))}
            {project.stack.length > 3 && (
              <li>
                <Badge tone="outline">+{project.stack.length - 3}</Badge>
              </li>
            )}
          </ul>
        )}
      </div>
      <ArrowUpRight
        className="absolute right-4 top-4 size-8 rounded-full bg-background/90 p-1.5 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </article>
  );
}

export function ProjectGrid({ projects, priorityCount = 0 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} priority={index < priorityCount} />
      ))}
    </div>
  );
}

export function StatStrip({ stats }) {
  if (!stats.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
      {stats.slice(0, 4).map((stat) => (
        <div key={stat.id} className="flex flex-col-reverse gap-1 bg-background p-5 sm:p-6">
          <dt className="text-sm text-muted">{stat.label}</dt>
          <dd className="text-3xl font-semibold tracking-tight sm:text-4xl">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CtaBand() {
  return (
    <Section>
      <div className="flex flex-col items-start gap-8 rounded-xl bg-foreground px-6 py-12 text-background sm:px-12 sm:py-16 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl space-y-3">
          <h2 className="text-h2">Have a product in mind?</h2>
          <p className="text-background/70 sm:text-lg">
            Tell me about your goals and let&apos;s work out the right way to build it.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-background px-6 font-medium text-foreground transition-opacity hover:opacity-90 focus-visible:ring-offset-foreground"
        >
          Start a conversation
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </Section>
  );
}
