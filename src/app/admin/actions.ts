'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gppc2026'

export async function verifyAdminPassword(password: string) {
  return password === ADMIN_PASSWORD
}

export async function getAppointments(dateFrom: string, dateTo: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      clients (*),
      providers (*),
      services (*)
    `)
    .gte('starts_at', `${dateFrom}T00:00:00`)
    .lte('starts_at', `${dateTo}T23:59:59`)
    .order('starts_at', { ascending: true })

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }

  return data || []
}

export async function getProviders() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('providers')
    .select('*')
    .eq('active', true)
  return data || []
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)

  if (error) {
    console.error('Error updating appointment:', error)
    return { success: false }
  }
  return { success: true }
}

export async function getWorkingHours() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('provider_working_hours')
    .select('*, providers(first_name, last_name)')
    .order('day_of_week', { ascending: true })

  if (error) {
    console.error('Error fetching working hours:', error)
    return []
  }
  return data || []
}

export async function updateWorkingHours(
  id: string,
  updates: { start_time?: string; end_time?: string; is_working?: boolean }
) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('provider_working_hours')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating working hours:', error)
    return { success: false }
  }
  return { success: true }
}

export async function updateProviderStatus(providerId: string, bookingStatus: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('providers')
    .update({ booking_status: bookingStatus })
    .eq('id', providerId)

  if (error) {
    console.error('Error updating provider status:', error)
    return { success: false }
  }
  return { success: true }
}
