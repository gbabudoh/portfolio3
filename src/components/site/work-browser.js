'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { ProjectGrid } from '@/components/site/blocks';

export function WorkBrowser({ projects }) {
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => {
    const counts = new Map();
    for (const p of projects) counts.set(p.category, (counts.get(p.category) || 0) + 1);
    return [['All', projects.length], ...counts.entries()];
  }, [projects]);

  const visible = category === 'All' ? projects : projects.filter((p) => p.category === category);

  return (
    <>
      <div className="-mx-5 mb-10 overflow-x-auto px-5 scrollbar-hide sm:mx-0 sm:px-0">
        <div role="group" aria-label="Filter by category" className="flex w-max gap-2">
          {categories.map(([name, count]) => {
            const active = name === category;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(name)}
                className={cn(
                  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors',
                  active
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted hover:border-foreground/30 hover:text-foreground'
                )}
              >
                {name}
                <span className={cn('font-mono text-xs', active ? 'text-background/60' : 'text-muted/70')}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? 'project' : 'projects'}
      </p>

      {visible.length > 0 ? (
        <ProjectGrid projects={visible} priorityCount={3} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-12 text-center text-muted">
          No projects in this category yet.
        </p>
      )}
    </>
  );
}
