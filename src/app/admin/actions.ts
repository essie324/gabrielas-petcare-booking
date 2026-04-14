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
