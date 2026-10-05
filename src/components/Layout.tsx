import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '🏡' },
  { to: '/properties', label: 'Properties', icon: '🗂️' },
]

export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-6xl">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-beige-200 px-5 py-6 sm:flex">
          <div className="mb-8 flex items-center gap-2 px-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400/90 text-lg">🏡</span>
            <div>
              <p className="font-serif text-base font-semibold leading-tight text-ink-900">Haven Host Hub</p>
              <p className="text-xs text-ink-700/60">Haven Accommodations</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-gold-300/40 text-ink-900' : 'text-ink-700/70 hover:bg-beige-100'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-beige-200 pt-4">
            <p className="truncate px-1 text-xs text-ink-700/60">{user?.email}</p>
            <button
              onClick={signOut}
              className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-700/80 hover:bg-beige-100"
            >
              <span>🚪</span> Log out
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-beige-200 bg-cream/80 px-4 py-3 backdrop-blur sm:hidden">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/90 text-base">🏡</span>
              <p className="font-serif text-base font-semibold text-ink-900">Haven Host Hub</p>
            </div>
            <button onClick={signOut} className="rounded-lg px-2 py-1 text-xs font-medium text-ink-700/70 hover:bg-beige-100">
              Log out
            </button>
          </header>

          <main className="flex-1 px-4 pb-24 pt-5 sm:px-8 sm:pb-10 sm:pt-8">
            <Outlet />
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-beige-200 bg-white/95 backdrop-blur sm:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                    isActive ? 'text-gold-700' : 'text-ink-700/60'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
