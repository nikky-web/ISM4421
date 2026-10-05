import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { Badge, Button, Card, EmptyState, PageHeader } from '../components/ui'
import { loadSampleData, clearSampleData } from '../lib/sampleData'
import { formatShortDate, relativeDay } from '../lib/dates'
import type { Booking, Task } from '../types'

const PRIORITY_TONE: Record<Task['priority'], 'neutral' | 'gold' | 'warning' | 'danger'> = {
  low: 'neutral',
  normal: 'gold',
  high: 'warning',
  urgent: 'danger',
}

export default function Dashboard() {
  const { user } = useAuth()
  const { properties, bookings, tasks, loading, hasSampleData, refresh } = useData()
  const [busy, setBusy] = useState(false)

  const propertyName = useMemo(() => {
    const map = new Map(properties.map((p) => [p.id, p]))
    return (id: string) => map.get(id)
  }, [properties])

  const attentionTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'done')
      .filter((t) => t.priority === 'urgent' || t.priority === 'high' || (t.due_date && relativeDay(t.due_date).includes('ago')))
      .slice(0, 8)
  }, [tasks])

  const upcomingEvents = useMemo(() => {
    const events: { date: string; kind: 'check-in' | 'check-out'; booking: Booking }[] = []
    for (const b of bookings) {
      if (b.status === 'cancelled') continue
      const inDiff = relativeDay(b.check_in)
      const outDiff = relativeDay(b.check_out)
      if (!inDiff.includes('ago') && inDiff !== 'Yesterday') events.push({ date: b.check_in, kind: 'check-in', booking: b })
      if (!outDiff.includes('ago') && outDiff !== 'Yesterday') events.push({ date: b.check_out, kind: 'check-out', booking: b })
    }
    return events.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8)
  }, [bookings])

  const openMaintenance = useMemo(
    () => tasks.filter((t) => t.type === 'maintenance' && t.status !== 'done').slice(0, 6),
    [tasks],
  )

  async function handleLoadSample() {
    if (!user) return
    setBusy(true)
    try {
      await loadSampleData(user.id)
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleClearSample() {
    if (!user) return
    setBusy(true)
    try {
      await clearSampleData(user.id)
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-700/60">Loading your properties…</p>
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon="🏡"
        title="Welcome to Haven Host Hub"
        hint="Add your first property, or load clearly-labeled sample properties and tasks to explore the app risk-free."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/properties">
              <Button>Add a property</Button>
            </Link>
            <Button variant="secondary" onClick={handleLoadSample} disabled={busy}>
              {busy ? 'Loading…' : 'Load sample data'}
            </Button>
          </div>
        }
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${properties.length} ${properties.length === 1 ? 'property' : 'properties'} under management`}
        action={
          hasSampleData ? (
            <Button variant="ghost" onClick={handleClearSample} disabled={busy} className="text-xs">
              {busy ? 'Clearing…' : 'Clear sample data'}
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleLoadSample} disabled={busy} className="text-xs">
              {busy ? 'Loading…' : 'Load sample data'}
            </Button>
          )
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Properties" value={properties.length} icon="🗂️" />
        <StatCard label="Upcoming stays" value={upcomingEvents.length} icon="🧳" />
        <StatCard label="Open tasks" value={tasks.filter((t) => t.status !== 'done').length} icon="📋" />
        <StatCard label="Needs attention" value={attentionTasks.length} icon="⚠️" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-serif text-lg font-semibold text-ink-900">Needs your attention</h2>
          {attentionTasks.length === 0 ? (
            <p className="text-sm text-ink-700/60">Nothing urgent — nice work staying ahead of it.</p>
          ) : (
            <ul className="space-y-2.5">
              {attentionTasks.map((t) => {
                const prop = propertyName(t.property_id)
                return (
                  <li key={t.id}>
                    <Link
                      to={`/properties/${t.property_id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-beige-200 bg-beige-50/60 px-3 py-2.5 hover:bg-beige-100"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{t.title}</p>
                        <p className="truncate text-xs text-ink-700/60">
                          {prop ? `${prop.icon} ${prop.name}` : 'Unknown property'}
                          {t.due_date ? ` · due ${relativeDay(t.due_date).toLowerCase()}` : ''}
                        </p>
                      </div>
                      <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-serif text-lg font-semibold text-ink-900">Upcoming check-ins &amp; checkouts</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-ink-700/60">No check-ins or checkouts coming up.</p>
          ) : (
            <ul className="space-y-2.5">
              {upcomingEvents.map((ev, i) => {
                const prop = propertyName(ev.booking.property_id)
                return (
                  <li key={`${ev.booking.id}-${ev.kind}-${i}`}>
                    <Link
                      to={`/properties/${ev.booking.property_id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-beige-200 bg-beige-50/60 px-3 py-2.5 hover:bg-beige-100"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{ev.booking.guest_name}</p>
                        <p className="truncate text-xs text-ink-700/60">
                          {prop ? `${prop.icon} ${prop.name}` : 'Unknown property'} · {relativeDay(ev.date)} ({formatShortDate(ev.date)})
                        </p>
                      </div>
                      <Badge tone={ev.kind === 'check-in' ? 'info' : 'gold'}>{ev.kind === 'check-in' ? 'Check-in' : 'Checkout'}</Badge>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 font-serif text-lg font-semibold text-ink-900">Maintenance requests</h2>
          {openMaintenance.length === 0 ? (
            <p className="text-sm text-ink-700/60">No open maintenance requests.</p>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {openMaintenance.map((t) => {
                const prop = propertyName(t.property_id)
                return (
                  <li key={t.id}>
                    <Link
                      to={`/properties/${t.property_id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-beige-200 bg-beige-50/60 px-3 py-2.5 hover:bg-beige-100"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{t.title}</p>
                        <p className="truncate text-xs text-ink-700/60">{prop ? `${prop.icon} ${prop.name}` : 'Unknown property'}</p>
                      </div>
                      <Badge tone={t.status === 'in_progress' ? 'info' : 'neutral'}>
                        {t.status === 'in_progress' ? 'In progress' : 'Pending'}
                      </Badge>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-300/40 text-lg">{icon}</span>
      <div>
        <p className="font-serif text-xl font-semibold leading-none text-ink-900">{value}</p>
        <p className="text-xs text-ink-700/60">{label}</p>
      </div>
    </Card>
  )
}
