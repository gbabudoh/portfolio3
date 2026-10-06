'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDialog } from '@/lib/use-dialog';
import { Button } from '@/components/ui/button';

export { AdminPageHeader, Card, CardHeader, EmptyState, SearchInput, SkeletonRows } from '@/components/admin/primitives';

/* ------------------------------------------------------------------ Sheet */

export function Sheet({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panelRef = useDialog(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full animate-slide-in-right flex-col border-l border-border bg-background shadow-2xl',
          size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="space-y-0.5">
            <h2 id="sheet-title" className="text-base font-semibold">{title}</h2>
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close panel">
            <X />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border bg-surface px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Confirm dialog */

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options) => {
    setState(options);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && <ConfirmDialog {...state} onCancel={() => close(false)} onConfirm={() => close(true)} />}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ title, description, confirmLabel = 'Delete', tone = 'danger', onCancel, onConfirm }) {
  const panelRef = useDialog(true, onCancel);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="relative w-full max-w-md animate-fade-up rounded-lg border border-border bg-background p-6 shadow-2xl"
      >
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h2 id="confirm-title" className="font-semibold">{title}</h2>
            <p id="confirm-description" className="text-sm text-muted">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} data-autofocus>
            Cancel
          </Button>
          <Button variant={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}

/* ------------------------------------------------------------------ Toasts */

const ToastContext = createContext(null);
const TOAST_ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const TOAST_TONES = { success: 'text-success', error: 'text-danger', info: 'text-accent-text' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, type = 'success') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-2), { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6"
      >
        {toasts.map((t) => {
          const ToastIcon = TOAST_ICONS[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full animate-fade-up items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm shadow-lg sm:w-80"
            >
              <ToastIcon className={cn('size-4 shrink-0', TOAST_TONES[t.type])} aria-hidden="true" />
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded text-muted hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

/* ------------------------------------------------------------------ Fetch */

// Small JSON helper for admin API calls with consistent error handling.
export async function api(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Your session has expired.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data;
}
