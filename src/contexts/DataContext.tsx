import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Booking, Property, Task } from '../types'

interface DataContextValue {
  properties: Property[]
  bookings: Booking[]
  tasks: Task[]
  loading: boolean
  error: string | null
  hasSampleData: boolean
  refresh: () => Promise<void>

  createProperty: (input: Partial<Property>) => Promise<void>
  updateProperty: (id: string, input: Partial<Property>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>

  createBooking: (input: Partial<Booking>) => Promise<void>
  updateBooking: (id: string, input: Partial<Booking>) => Promise<void>
  deleteBooking: (id: string) => Promise<void>

  createTask: (input: Partial<Task>) => Promise<void>
  updateTask: (id: string, input: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setProperties([])
      setBookings([])
      setTasks([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const [propRes, bookingRes, taskRes] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: true }),
      supabase.from('bookings').select('*').order('check_in', { ascending: true }),
      supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }),
    ])

    const firstError = propRes.error || bookingRes.error || taskRes.error
    if (firstError) {
      setError(firstError.message)
    } else {
      setProperties((propRes.data as Property[]) ?? [])
      setBookings((bookingRes.data as Booking[]) ?? [])
      setTasks((taskRes.data as Task[]) ?? [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo<DataContextValue>(
    () => ({
      properties,
      bookings,
      tasks,
      loading,
      error,
      hasSampleData: properties.some((p) => p.is_sample),
      refresh,

      async createProperty(input) {
        const { error } = await supabase.from('properties').insert([{ ...input, user_id: user?.id }])
        if (error) throw error
        await refresh()
      },
      async updateProperty(id, input) {
        const { error } = await supabase.from('properties').update(input).eq('id', id)
        if (error) throw error
        await refresh()
      },
      async deleteProperty(id) {
        const { error } = await supabase.from('properties').delete().eq('id', id)
        if (error) throw error
        await refresh()
      },

      async createBooking(input) {
        const { error } = await supabase.from('bookings').insert([{ ...input, user_id: user?.id }])
        if (error) throw error
        await refresh()
      },
      async updateBooking(id, input) {
        const { error } = await supabase.from('bookings').update(input).eq('id', id)
        if (error) throw error
        await refresh()
      },
      async deleteBooking(id) {
        const { error } = await supabase.from('bookings').delete().eq('id', id)
        if (error) throw error
        await refresh()
      },

      async createTask(input) {
        const { error } = await supabase.from('tasks').insert([{ ...input, user_id: user?.id }])
        if (error) throw error
        await refresh()
      },
      async updateTask(id, input) {
        const { error } = await supabase.from('tasks').update(input).eq('id', id)
        if (error) throw error
        await refresh()
      },
      async deleteTask(id) {
        const { error } = await supabase.from('tasks').delete().eq('id', id)
        if (error) throw error
        await refresh()
      },
    }),
    [properties, bookings, tasks, loading, error, refresh, user],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
