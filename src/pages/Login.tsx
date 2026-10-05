import { useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button, Input, Label } from '../components/ui'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error, needsConfirmation } = await signUp(email, password, fullName)
        if (error) setError(error)
        else if (needsConfirmation) setNotice('Account created! Check your email to confirm, then log in.')
      } else {
        const { error } = await signIn(email, password)
        if (error) setError(error)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-beige-100 via-cream to-beige-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400/90 text-2xl shadow-sm shadow-gold-500/30">
            🏡
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink-900">Haven Host Hub</h1>
          <p className="mt-1 text-sm text-ink-700/70">Haven Accommodations · remote property manager</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Supabase isn't configured yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to a <code>.env</code> file (see{' '}
            <code>.env.example</code>) and restart the dev server.
          </div>
        )}

        <div className="rounded-2xl border border-beige-200 bg-white/90 p-6 shadow-sm shadow-ink-900/5">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-beige-100 p-1">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setNotice(null) }}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${mode === 'signin' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-700/70'}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setNotice(null) }}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-700/70'}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <Label>Full name</Label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jamie Host"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}

            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-700/50">
          Each account only ever sees its own properties, tasks, and bookings.
        </p>
      </div>
    </div>
  )
}
