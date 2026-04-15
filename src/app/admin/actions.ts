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

export async function updateProviderInfo(
  providerId: string,
  updates: { email?: string; phone?: string; bio?: string }
) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('providers')
    .update(updates)
    .eq('id', providerId)

  if (error) {
    console.error('Error updating provider info:', error)
    return { success: false }
  }
  return { success: true }
}

export async function addProvider(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  bookingStatus: string
}) {
  const supabase = await createServerSupabaseClient()

  // Insert provider
  const { data: newProvider, error } = await supabase
    .from('providers')
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      bio: data.bio || null,
      booking_status: data.bookingStatus,
      specialty_tags: [],
      active: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error adding provider:', error)
    return { success: false, error: error.message }
  }

  // Create default working hours (Mon-Sat 8am-6pm, Sunday off)
  const hours = []
  for (let day = 0; day <= 6; day++) {
    hours.push({
      provider_id: newProvider.id,
      day_of_week: day,
      start_time: '08:00',
      end_time: '18:00',
      is_working: day >= 1 && day <= 6, // Mon-Sat on, Sunday off
    })
  }

  const { error: hoursError } = await supabase
    .from('provider_working_hours')
    .insert(hours)

  if (hoursError) {
    console.error('Error adding working hours:', hoursError)
  }

  return { success: true, providerId: newProvider.id }
}

export async function removeProvider(providerId: string) {
  const supabase = await createServerSupabaseClient()

  // Soft delete — set active to false
  const { error } = await supabase
    .from('providers')
    .update({ active: false })
    .eq('id', providerId)

  if (error) {
    console.error('Error removing provider:', error)
    return { success: false }
  }
  return { success: true }
}

// ── Client Management ──────────────────────

export async function getClients(search?: string) {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (search && search.trim()) {
    const s = search.trim().toLowerCase()
    query = query.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,pet_name.ilike.%${s}%`)
  }

  const { data, error } = await query
  if (error) { console.error('Error fetching clients:', error); return [] }
  return data || []
}

export async function getClientWithAppointments(clientId: string) {
  const supabase = await createServerSupabaseClient()

  const [{ data: client }, { data: appointments }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', clientId).single(),
    supabase
      .from('appointments')
      .select('*, services(*), providers(first_name, last_name)')
      .eq('client_id', clientId)
      .order('starts_at', { ascending: false }),
  ])

  return { client, appointments: appointments || [] }
}

export async function updateClient(
  clientId: string,
  updates: {
    first_name?: string; last_name?: string
    email?: string; phone?: string
    pet_name?: string; pet_type?: string; pet_notes?: string
    profile_photo_url?: string
  }
) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId)

  if (error) { console.error('Error updating client:', error); return { success: false } }
  return { success: true }
}

export async function getClientPhotos(clientId: string) {
  const supabase = await createServerSupabaseClient()

  // Get inspiration photos from appointments
  const { data } = await supabase
    .from('appointments')
    .select('id, booking_ref, inspiration_photo_url, starts_at')
    .eq('client_id', clientId)
    .not('inspiration_photo_url', 'is', null)
    .order('starts_at', { ascending: false })

  return data || []
}

// Email notification for new bookings
export async function sendBookingNotification(booking: {
  clientName: string
  clientEmail: string
  clientPhone: string
  petName: string
  serviceName: string
  providerName: string
  date: string
  time: string
  bookingRef: string
}) {
  // Get provider emails/phones for notification
  const supabase = await createServerSupabaseClient()
  const { data: providers } = await supabase
    .from('providers')
    .select('email, phone, first_name')
    .eq('active', true)

  const staffEmails = (providers || [])
    .filter(p => p.email)
    .map(p => p.email as string)

  const staffPhones = (providers || [])
    .filter(p => p.phone)
    .map(p => ({ phone: p.phone as string, name: p.first_name }))

  return {
    staffEmails,
    staffPhones,
    booking,
  }
}
