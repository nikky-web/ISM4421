import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { Badge, Button, Card, EmptyState, Input, Label, Modal, PageHeader, Textarea } from '../components/ui'
import { PROPERTY_ICONS, type Property } from '../types'

export default function Properties() {
  const { properties, bookings, tasks, createProperty, updateProperty, deleteProperty } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(p: Property) {
    setEditing(p)
    setModalOpen(true)
  }

  async function handleDelete(p: Property) {
    if (!confirm(`Delete "${p.name}"? This also removes its bookings and tasks.`)) return
    await deleteProperty(p.id)
  }

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle="Every Haven Accommodations listing you manage, in one place."
        action={<Button onClick={openCreate}>+ Add property</Button>}
      />

      {properties.length === 0 ? (
        <EmptyState
          icon="🗂️"
          title="No properties yet"
          hint="Add your first property to start tracking cleanings, bookings, and maintenance."
          action={<Button onClick={openCreate}>Add a property</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => {
            const openTasks = tasks.filter((t) => t.property_id === p.id && t.status !== 'done').length
            const upcoming = bookings.filter((b) => b.property_id === p.id && b.status !== 'cancelled' && b.status !== 'completed').length
            return (
              <Card key={p.id} className="flex flex-col p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-300/40 text-xl">{p.icon}</span>
                    <div>
                      <p className="font-serif font-semibold text-ink-900">{p.name}</p>
                      {p.property_type && <p className="text-xs text-ink-700/60">{p.property_type}</p>}
                    </div>
                  </div>
                  {p.is_sample && <Badge tone="gold">Sample</Badge>}
                </div>
                {p.address && <p className="mb-3 text-sm text-ink-700/70">{p.address}</p>}
                <div className="mb-4 flex gap-2">
                  <Badge tone="neutral">{openTasks} open task{openTasks === 1 ? '' : 's'}</Badge>
                  <Badge tone="neutral">{upcoming} active booking{upcoming === 1 ? '' : 's'}</Badge>
                </div>
                <div className="mt-auto flex gap-2">
                  <Link to={`/properties/${p.id}`} className="flex-1">
                    <Button variant="primary" className="w-full">View</Button>
                  </Link>
                  <Button variant="secondary" onClick={() => openEdit(p)}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDelete(p)}>Delete</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <PropertyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onCreate={createProperty}
        onUpdate={updateProperty}
      />
    </div>
  )
}

function PropertyModal({
  open,
  onClose,
  editing,
  onCreate,
  onUpdate,
}: {
  open: boolean
  onClose: () => void
  editing: Property | null
  onCreate: (input: Partial<Property>) => Promise<void>
  onUpdate: (id: string, input: Partial<Property>) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [notes, setNotes] = useState('')
  const [icon, setIcon] = useState('🏠')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(editing?.name ?? '')
    setAddress(editing?.address ?? '')
    setPropertyType(editing?.property_type ?? '')
    setNotes(editing?.notes ?? '')
    setIcon(editing?.icon ?? '🏠')
  }, [open, editing])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = { name, address: address || null, property_type: propertyType || null, notes: notes || null, icon }
      if (editing) await onUpdate(editing.id, payload)
      else await onCreate(payload)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit property' : 'Add a property'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Icon</Label>
          <div className="flex gap-1.5">
            {PROPERTY_ICONS.map((i) => (
              <button
                type="button"
                key={i}
                onClick={() => setIcon(i)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors ${
                  icon === i ? 'bg-gold-400/80 ring-2 ring-gold-500' : 'bg-beige-100 hover:bg-beige-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Property name</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seaside Bungalow" />
        </div>
        <div>
          <Label>Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, State" />
        </div>
        <div>
          <Label>Property type</Label>
          <Input value={propertyType} onChange={(e) => setPropertyType(e.target.value)} placeholder="Beach bungalow, cabin, loft…" />
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Lockbox code, parking notes, anything you'd want remotely…" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy || !name.trim()}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add property'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
