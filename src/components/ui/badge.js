import { cn } from '@/lib/cn';

const tones = {
  neutral: 'border-border bg-subtle text-muted',
  accent: 'border-transparent bg-accent-soft text-accent-text',
  success: 'border-transparent bg-success/10 text-success',
  warning: 'border-transparent bg-warning/10 text-warning',
  danger: 'border-transparent bg-danger/10 text-danger',
  outline: 'border-border bg-transparent text-muted',
};

export function Badge({ tone = 'neutral', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
