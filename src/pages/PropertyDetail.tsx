import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { Badge, Button, Card, EmptyState, Input, Label, Modal, Select, Textarea } from '../components/ui'
import { formatDate, relativeDay } from '../lib/dates'
import type { Booking, BookingStatus, Task, TaskPriority, TaskStatus, TaskType } from '../types'

const STATUS_TONE: Record<TaskStatus, 'neutral' | 'info' | 'success'> = {
  pending: 'neutral',
  in_progress: 'info',
  done: 'success',
}

const PRIORITY_TONE: Record<TaskPriority, 'neutral' | 'gold' | 'warning' | 'danger'> = {
  low: 'neutral',
  normal: 'gold',
  high: 'warning',
  urgent: 'danger',
}

const BOOKING_TONE: Record<BookingStatus, 'info' | 'success' | 'neutral' | 'danger'> = {
  upcoming: 'info',
  active: 'success',
  completed: 'neutral',
  cancelled: 'danger',
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const { properties, bookings, tasks, deleteBooking, deleteTask, updateTask, createBooking, updateBooking, createTask, updateProperty } = useData()
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')

  const property = properties.find((p) => p.id === id)
  const propertyTasks = useMemo(
    () => tasks.filter((t) => t.property_id === id).sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999')),
    [tasks, id],
  )
  const propertyBookings = useMemo(
    () => bookings.filter((b) => b.property_id === id).sort((a, b) => a.check_in.localeCompare(b.check_in)),
    [bookings, id],
  )
  const cleaningTasks = propertyTasks.filter((t) => t.type === 'cleaning')
  const maintenanceTasks = propertyTasks.filter((t) => t.type === 'maintenance')
  const generalTasks = propertyTasks.filter((t) => t.type === 'general')

  if (!property) return <Navigate to="/properties" replace />

  async function handleDeleteTask(t: Task) {
    if (!confirm(`Delete task "${t.title}"?`)) return
    await deleteTask(t.id)
  }

  async function handleDeleteBooking(b: Booking) {
    if (!confirm(`Delete booking for ${b.guest_name}?`)) return
    await deleteBooking(b.id)
  }

  async function cycleTaskStatus(t: Task) {
    const next: Record<TaskStatus, TaskStatus> = { pending: 'in_progress', in_progress: 'done', done: 'pending' }
    await updateTask(t.id, { status: next[t.status] })
  }

  function startEditNotes() {
    setNotesDraft(property!.notes ?? '')
    setEditingNotes(true)
  }

  async function saveNotes() {
    await updateProperty(property!.id, { notes: notesDraft || null })
    setEditingNotes(false)
  }

  return (
    <div>
      <Link to="/properties" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-700/70 hover:text-ink-900">
        ← All properties
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-300/40 text-2xl">{property.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-ink-900">{property.name}</h1>
              {property.is_sample && <Badge tone="gold">Sample</Badge>}
            </div>
            {property.address && <p className="text-sm text-ink-700/70">{property.address}</p>}
            {property.property_type && <p className="text-xs text-ink-700/50">{property.property_type}</p>}
          </div>
        </div>
      </div>

      <Card className="mb-5 p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-ink-900">Notes</h2>
          {!editingNotes && (
            <button onClick={startEditNotes} className="text-xs font-medium text-gold-700 hover:underline">
              Edit
            </button>
          )}
        </div>
        {editingNotes ? (
          <div className="space-y-2">
            <Textarea rows={3} value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder="Lockbox code, parking notes…" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditingNotes(false)}>Cancel</Button>
              <Button onClick={saveNotes}>Save</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-700/70">{property.notes || 'No notes yet.'}</p>
        )}
      </Card>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-ink-900">Bookings</h2>
        <Button
          variant="secondary"
          onClick={() => {
            setEditingBooking(null)
            setBookingModalOpen(true)
          }}
        >
          + Add booking
        </Button>
      </div>
      {propertyBookings.length === 0 ? (
        <EmptyState icon="🧳" title="No bookings yet" hint="Add a check-in and checkout to track this property's stays." />
      ) : (
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          {propertyBookings.map((b) => (
            <Card key={b.id} className="p-4">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <p className="font-medium text-ink-900">{b.guest_name}</p>
                <Badge tone={BOOKING_TONE[b.status]}>{b.status}</Badge>
              </div>
              <p className="text-sm text-ink-700/70">
                Check-in {formatDate(b.check_in)} ({relativeDay(b.check_in)})
              </p>
              <p className="text-sm text-ink-700/70">
                Checkout {formatDate(b.check_out)} ({relativeDay(b.check_out)})
              </p>
              {b.notes && <p className="mt-1.5 text-xs text-ink-700/60">{b.notes}</p>}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setEditingBooking(b)
                    setBookingModalOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" className="text-xs" onClick={() => handleDeleteBooking(b)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-ink-900">Tasks</h2>
        <Button
          variant="secondary"
          onClick={() => {
            setEditingTask(null)
            setTaskModalOpen(true)
          }}
        >
          + Add task
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <TaskColumn
          title="Cleaning schedule"
          emptyHint="No cleaning tasks yet."
          taskList={cleaningTasks}
          onEdit={(t) => { setEditingTask(t); setTaskModalOpen(true) }}
          onDelete={handleDeleteTask}
          onCycle={cycleTaskStatus}
        />
        <TaskColumn
          title="Maintenance"
          emptyHint="No maintenance requests."
          taskList={maintenanceTasks}
          onEdit={(t) => { setEditingTask(t); setTaskModalOpen(true) }}
          onDelete={handleDeleteTask}
          onCycle={cycleTaskStatus}
        />
        <TaskColumn
          title="General tasks"
          emptyHint="No general tasks."
          taskList={generalTasks}
          onEdit={(t) => { setEditingTask(t); setTaskModalOpen(true) }}
          onDelete={handleDeleteTask}
          onCycle={cycleTaskStatus}
        />
      </div>

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        editing={editingTask}
        propertyId={property.id}
        onCreate={createTask}
        onUpdate={updateTask}
      />
      <BookingModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        editing={editingBooking}
        propertyId={property.id}
        onCreate={createBooking}
        onUpdate={updateBooking}
      />
    </div>
  )
}

function TaskColumn({
  title,
  emptyHint,
  taskList,
  onEdit,
  onDelete,
  onCycle,
}: {
  title: string
  emptyHint: string
  taskList: Task[]
  onEdit: (t: Task) => void
  onDelete: (t: Task) => void
  onCycle: (t: Task) => void
}) {
  return (
    <div>
      <h3 className="mb-2.5 text-sm font-semibold text-ink-700/80">{title}</h3>
      {taskList.length === 0 ? (
        <p className="rounded-xl border border-dashed border-beige-300 bg-beige-50/50 px-3 py-4 text-center text-xs text-ink-700/50">
          {emptyHint}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {taskList.map((t) => (
            <li key={t.id}>
              <Card className="p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium text-ink-900 ${t.status === 'done' ? 'line-through text-ink-700/50' : ''}`}>
                    {t.title}
                  </p>
                  <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                </div>
                {t.description && <p className="mb-1.5 text-xs text-ink-700/60">{t.description}</p>}
                {t.due_date && <p className="mb-2 text-xs text-ink-700/50">Due {relativeDay(t.due_date)}</p>}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onCycle(t)}
                    className="text-left"
                  >
                    <Badge tone={STATUS_TONE[t.status]}>{t.status.replace('_', ' ')} · tap to advance</Badge>
                  </button>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <Button variant="secondary" className="flex-1 px-2 py-1 text-xs" onClick={() => onEdit(t)}>Edit</Button>
                  <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => onDelete(t)}>Delete</Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TaskModal({
  open,
  onClose,
  editing,
  propertyId,
  onCreate,
  onUpdate,
}: {
  open: boolean
  onClose: () => void
  editing: Task | null
  propertyId: string
  onCreate: (input: Partial<Task>) => Promise<void>
  onUpdate: (id: string, input: Partial<Task>) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<TaskType>('cleaning')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [status, setStatus] = useState<TaskStatus>('pending')
  const [dueDate, setDueDate] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setDescription(editing?.description ?? '')
    setType(editing?.type ?? 'cleaning')
    setPriority(editing?.priority ?? 'normal')
    setStatus(editing?.status ?? 'pending')
    setDueDate(editing?.due_date ?? '')
  }, [open, editing])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        title,
        description: description || null,
        type,
        priority,
        status,
        due_date: dueDate || null,
        property_id: propertyId,
      }
      if (editing) await onUpdate(editing.id, payload)
      else await onCreate(payload)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit task' : 'Add a task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Turnover clean before next check-in" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value as TaskType)}>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="general">General</option>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </Select>
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details…" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy || !title.trim()}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function BookingModal({
  open,
  onClose,
  editing,
  propertyId,
  onCreate,
  onUpdate,
}: {
  open: boolean
  onClose: () => void
  editing: Booking | null
  propertyId: string
  onCreate: (input: Partial<Booking>) => Promise<void>
  onUpdate: (id: string, input: Partial<Booking>) => Promise<void>
}) {
  const [guestName, setGuestName] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [status, setStatus] = useState<BookingStatus>('upcoming')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setGuestName(editing?.guest_name ?? '')
    setCheckIn(editing?.check_in ?? '')
    setCheckOut(editing?.check_out ?? '')
    setStatus(editing?.status ?? 'upcoming')
    setNotes(editing?.notes ?? '')
  }, [open, editing])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        guest_name: guestName,
        check_in: checkIn,
        check_out: checkOut,
        status,
        notes: notes || null,
        property_id: propertyId,
      }
      if (editing) await onUpdate(editing.id, payload)
      else await onCreate(payload)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit booking' : 'Add a booking'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Guest name</Label>
          <Input required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Jane Doe (use a label, not real guest info, for testing)" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Check-in</Label>
            <Input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div>
            <Label>Checkout</Label>
            <Input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy || !guestName.trim() || !checkIn || !checkOut}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add booking'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
