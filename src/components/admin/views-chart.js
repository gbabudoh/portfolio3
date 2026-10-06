'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

const fmtDay = (iso, opts) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });

// Single-series column chart: daily page views. Each column is its own hover/focus
// target (taller than the mark); values are also available in the data table.
export function ViewsChart({ data }) {
  const [active, setActive] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(1, ...data.map((d) => d.views));
  const total = data.reduce((sum, d) => sum + d.views, 0);
  const point = active !== null ? data[active] : null;

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight">{total.toLocaleString('en-GB')}</p>
          <p className="text-xs text-muted">
            {point ? (
              <>
                <span className="font-medium text-foreground">{point.views.toLocaleString('en-GB')}</span> views on{' '}
                {fmtDay(point.day, { weekday: 'short', day: 'numeric', month: 'short' })}
              </>
            ) : (
              'Total over the last 14 days'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          aria-pressed={showTable}
          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-subtle hover:text-foreground"
        >
          {showTable ? 'Chart' : 'Table'}
        </button>
      </div>

      {showTable ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 text-right font-medium">Views</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {data.map((d) => (
              <tr key={d.day} className="border-b border-border/60 last:border-0">
                <td className="py-1.5">{fmtDay(d.day, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                <td className="py-1.5 text-right">{d.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>
          <div className="relative h-40 pr-8" onPointerLeave={() => setActive(null)}>
            {/* Recessive guide lines at max and half */}
            <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-border" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-border" aria-hidden="true" />
            <span className="pointer-events-none absolute -top-2 right-0 bg-background pl-1 font-mono text-[10px] tabular-nums text-muted" aria-hidden="true">
              {max}
            </span>
            <ul className="relative flex h-full items-end" aria-label="Daily page views, last 14 days">
              {data.map((d, i) => {
                const height = d.views === 0 ? 0 : Math.max(3, (d.views / max) * 100);
                const label = `${fmtDay(d.day, { day: 'numeric', month: 'short' })}: ${d.views} views`;
                return (
                  <li key={d.day} className="flex h-full flex-1 justify-center">
                    <button
                      type="button"
                      aria-label={label}
                      onPointerEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive(null)}
                      className="group flex h-full w-full items-end justify-center rounded-sm focus-visible:ring-offset-0"
                    >
                      <span
                        className={cn(
                          'w-full max-w-6 rounded-t bg-chart transition-opacity',
                          active !== null && active !== i ? 'opacity-40' : 'opacity-100'
                        )}
                        style={{ height: `${height}%`, marginInline: '1px' }}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 font-mono text-[10px] text-muted" aria-hidden="true">
            <span>{fmtDay(data[0].day, { day: 'numeric', month: 'short' })}</span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  );
}
