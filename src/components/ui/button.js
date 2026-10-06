import Link from 'next/link';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors ' +
  'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0';

const variants = {
  primary: 'bg-accent text-accent-foreground hover:bg-accent/90',
  secondary: 'border border-border bg-background text-foreground hover:bg-subtle',
  ghost: 'text-muted hover:bg-subtle hover:text-foreground',
  danger: 'bg-danger text-white hover:bg-danger/90 dark:text-background',
  link: 'text-accent-text underline-offset-4 hover:underline px-0 h-auto',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'size-10',
  'icon-sm': 'size-8',
};

export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export const Button = forwardRef(function Button(
  { variant, size, className, type = 'button', ...props },
  ref
) {
  return <button ref={ref} type={type} className={buttonClasses({ variant, size, className })} {...props} />;
});

export function ButtonLink({ variant, size, className, href, external, ...props }) {
  const classes = buttonClasses({ variant, size, className });
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props} />;
  }
  return <Link href={href} className={classes} {...props} />;
}
