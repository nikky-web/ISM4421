import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
  const variants: Record<string, string> = {
    primary: 'bg-gold-500 text-ink-900 hover:bg-gold-600 shadow-sm shadow-gold-500/20',
    secondary: 'bg-white text-ink-800 border border-beige-200 hover:bg-beige-50',
    ghost: 'bg-transparent text-ink-700 hover:bg-beige-100',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-beige-200 bg-white/80 shadow-sm shadow-ink-900/5 ${className}`}>
      {children}
    </div>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-beige-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-700/40 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300/50 ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-beige-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-700/40 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300/50 ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-beige-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300/50 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-700/70">{children}</label>
}

const BADGE_STYLES: Record<string, string> = {
  neutral: 'bg-beige-100 text-ink-700',
  gold: 'bg-gold-300/40 text-gold-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
}

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof BADGE_STYLES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_STYLES[tone]}`}>
      {children}
    </span>
  )
}

export function EmptyState({ icon, title, hint, action }: { icon?: string; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-beige-300 bg-beige-50/50 px-6 py-10 text-center">
      {icon && <div className="mb-2 text-3xl">{icon}</div>}
      <p className="font-medium text-ink-800">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-ink-700/70">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-700/70">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-ink-700/60 hover:bg-beige-100 hover:text-ink-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
