import { supabase } from './supabase'

function daysFromNow(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

const SAMPLE_PROPERTIES = [
  {
    name: 'Sample: Seaside Bungalow',
    address: '12 Shoreline Ave, Destin, FL',
    property_type: 'Beach bungalow',
    notes: 'Lockbox code changes monthly — check the shared notes app.',
    icon: '🏖️',
  },
  {
    name: 'Sample: Downtown Loft',
    address: '488 Market St #4B, Charleston, SC',
    property_type: 'City loft',
    notes: 'Street parking only on weekdays after 6pm.',
    icon: '🏙️',
  },
  {
    name: 'Sample: Mountain Cabin',
    address: '77 Ridgeline Rd, Asheville, NC',
    property_type: 'Cabin',
    notes: 'Gravel driveway — warn guests with low cars.',
    icon: '🏔️',
  },
  {
    name: 'Sample: Lakeside Cottage',
    address: '3 Harbor Ln, Lake Geneva, WI',
    property_type: 'Cottage',
    notes: 'Dock key lives in the kitchen drawer.',
    icon: '🌴',
  },
]

export async function loadSampleData(userId: string) {
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .insert(
      SAMPLE_PROPERTIES.map((p) => ({ ...p, user_id: userId, is_sample: true })),
    )
    .select()

  if (propError) throw propError
  if (!properties || properties.length === 0) return

  const [beach, loft, cabin, cottage] = properties

  const bookings = [
    {
      property_id: beach.id,
      guest_name: 'Sample Guest: J. Rivera',
      check_in: daysFromNow(1),
      check_out: daysFromNow(5),
      status: 'upcoming',
      notes: 'Arriving late, ~9pm self check-in.',
    },
    {
      property_id: beach.id,
      guest_name: 'Sample Guest: A. Chen',
      check_in: daysFromNow(-2),
      check_out: daysFromNow(1),
      status: 'active',
      notes: 'Requested extra towels.',
    },
    {
      property_id: loft.id,
      guest_name: 'Sample Guest: The Patels',
      check_in: daysFromNow(3),
      check_out: daysFromNow(7),
      status: 'upcoming',
      notes: null,
    },
    {
      property_id: cabin.id,
      guest_name: 'Sample Guest: M. Thompson',
      check_in: daysFromNow(6),
      check_out: daysFromNow(10),
      status: 'upcoming',
      notes: 'Celebrating anniversary — left a note to add flowers.',
    },
    {
      property_id: cottage.id,
      guest_name: 'Sample Guest: K. Nguyen',
      check_in: daysFromNow(-10),
      check_out: daysFromNow(-6),
      status: 'completed',
      notes: null,
    },
  ].map((b) => ({ ...b, user_id: userId, is_sample: true }))

  const tasks = [
    {
      property_id: beach.id,
      type: 'cleaning',
      title: 'Turnover clean before next check-in',
      description: 'Standard checklist + restock coffee pods.',
      due_date: daysFromNow(1),
      priority: 'urgent',
      status: 'pending',
    },
    {
      property_id: beach.id,
      type: 'maintenance',
      title: 'Fix sticky sliding door to patio',
      description: 'Guest mentioned it in last review.',
      due_date: daysFromNow(4),
      priority: 'high',
      status: 'pending',
    },
    {
      property_id: loft.id,
      type: 'cleaning',
      title: 'Deep clean before Patel check-in',
      description: null,
      due_date: daysFromNow(3),
      priority: 'normal',
      status: 'pending',
    },
    {
      property_id: loft.id,
      type: 'general',
      title: 'Replace air filter',
      description: 'Due every 3 months.',
      due_date: daysFromNow(14),
      priority: 'low',
      status: 'pending',
    },
    {
      property_id: cabin.id,
      type: 'maintenance',
      title: 'Inspect propane level for fireplace',
      description: 'Refill if below 30%.',
      due_date: daysFromNow(5),
      priority: 'high',
      status: 'in_progress',
    },
    {
      property_id: cottage.id,
      type: 'cleaning',
      title: 'Post-checkout clean + dock check',
      description: 'Completed after last guest left.',
      due_date: daysFromNow(-5),
      priority: 'normal',
      status: 'done',
    },
    {
      property_id: cottage.id,
      type: 'general',
      title: 'Order new life jackets for dock',
      description: 'Two are showing wear.',
      due_date: daysFromNow(9),
      priority: 'normal',
      status: 'pending',
    },
  ].map((t) => ({ ...t, user_id: userId, is_sample: true }))

  const { error: bookingError } = await supabase.from('bookings').insert(bookings)
  if (bookingError) throw bookingError

  const { error: taskError } = await supabase.from('tasks').insert(tasks)
  if (taskError) throw taskError
}

export async function clearSampleData(userId: string) {
  await supabase.from('tasks').delete().eq('user_id', userId).eq('is_sample', true)
  await supabase.from('bookings').delete().eq('user_id', userId).eq('is_sample', true)
  await supabase.from('properties').delete().eq('user_id', userId).eq('is_sample', true)
}
