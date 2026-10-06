'use client';

import { useRef, useState } from 'react';
import { Brain, Cloud, Code2, Gauge, Layers, Server, Smartphone } from 'lucide-react';
import { cn } from '@/lib/cn';

const DOMAIN_ICONS = {
  'frontend-design': Code2,
  mobile: Smartphone,
  'backend-apis': Server,
  'cloud-devops-security': Cloud,
  'quality-performance': Gauge,
  'ai-engineering': Brain,
};

// Tabbed skills browser: domain list (vertical on desktop, scrollable pills on
// mobile) + a balanced detail panel. All panels stay in the DOM for SEO.
export function SkillsExplorer({ groups }) {
  const [active, setActive] = useState(groups[0]?.id);
  const tabRefs = useRef({});

  // Select a domain and keep its tab visible in the horizontally scrolling mobile row.
  function select(id) {
    setActive(id);
    tabRefs.current[id]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  function onKeyDown(event, index) {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next;
    if (event.key in keys) next = (index + keys[event.key] + groups.length) % groups.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = groups.length - 1;
    else return;
    event.preventDefault();
    const id = groups[next].id;
    select(id);
    tabRefs.current[id]?.focus();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
      {/* Domain tabs */}
      <div
        role="tablist"
        aria-label="Skill domains"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide sm:mx-0 sm:px-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
      >
        {groups.map((group, index) => {
          const selected = group.id === active;
          const DomainIcon = DOMAIN_ICONS[group.id] || Layers;
          return (
            <button
              key={group.id}
              ref={(el) => (tabRefs.current[group.id] = el)}
              id={`tab-${group.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${group.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(group.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                'group flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg border px-3.5 text-left text-sm font-medium transition-colors',
                'h-11 lg:h-12 lg:w-full',
                selected
                  ? 'border-border bg-background text-foreground shadow-sm'
                  : 'border-transparent text-muted hover:bg-background/60 hover:text-foreground'
              )}
            >
              <DomainIcon
                className={cn('size-4 shrink-0', selected ? 'text-accent-text' : 'text-muted group-hover:text-foreground')}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="flex-1">{group.name}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-mono text-[11px] tabular-nums',
                  selected ? 'bg-accent-soft text-accent-text' : 'bg-subtle text-muted'
                )}
              >
                {group.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="min-w-0">
        {groups.map((group) => (
          <div
            key={group.id}
            id={`panel-${group.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${group.id}`}
            hidden={group.id !== active}
            tabIndex={0}
            className="animate-fade-in overflow-hidden rounded-lg border border-border bg-background focus-visible:ring-offset-0"
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <h3 className="text-base">{group.name}</h3>
              <p className="text-xs text-muted">
                {group.count} {group.count === 1 ? 'technology' : 'technologies'}
              </p>
            </div>
            {/* Borders on cells (not a gap-px grid) keep every line a single, even hairline */}
            <dl className="-mb-px grid sm:grid-cols-2">
              {group.entries.map((entry, i) => (
                <div
                  key={entry.label || i}
                  className="space-y-2 border-b border-border px-5 py-4 sm:px-6 sm:odd:border-r"
                >
                  {entry.label && <dt className="text-[13px] font-medium text-muted">{entry.label}</dt>}
                  <dd>
                    <ul className="flex flex-wrap gap-1.5">
                      {entry.items.map((item) => (
                        <li key={item} className="rounded-md bg-subtle px-2.5 py-1 text-[13px] leading-5 text-foreground">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
              {/* Fill the last row so the grid never ends on an empty half */}
              {group.entries.length % 2 === 1 && (
                <div className="hidden border-b border-border sm:block" aria-hidden="true" />
              )}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
