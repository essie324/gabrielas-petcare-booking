'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function generateBookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'GP-'
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return ref
}

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
}

interface BookingData {
  // Client info
  existingClientId: string | null
  firstName: string
  lastName: string
  email: string
  phone: string
  petName: string
  petType: string
  petNotes: string
  // Booking info
  serviceId: string
  providerId: string
  date: string
  time: string
  serviceDuration: number
  // Extras
  referredByName: string | null
  howDidYouHear: string | null
  inspirationPhotoUrl: string | null
  paymentMethodId: string | null
  isFirstVisit: boolean
}

export async function bookAppointmentFromFlow(data: BookingData) {
  const supabase = await getSupabase()
  const bookingRef = generateBookingRef()

  try {
    let clientId = data.existingClientId

    // Create or update client
    if (!clientId) {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email.toLowerCase() || null,
          phone: data.phone.replace(/\D/g, '') || null,
          pet_name: data.petName || null,
          pet_type: data.petType || null,
          pet_notes: data.petNotes || null,
        })
        .select('id')
        .single()

      if (clientError) throw clientError
      clientId = newClient.id
    } else {
      // Update existing client with any new info
      await supabase
        .from('clients')
        .update({
          pet_name: data.petName || undefined,
          pet_type: data.petType || undefined,
          pet_notes: data.petNotes || undefined,
        })
        .eq('id', clientId)
    }

    // Calculate start and end times
    const startsAt = new Date(`${data.date}T${data.time}:00`)
    const endsAt = new Date(startsAt.getTime() + data.serviceDuration * 60000)

    // Create appointment
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        provider_id: data.providerId,
        service_id: data.serviceId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: 'confirmed',
        referred_by_name: data.referredByName || null,
        how_did_you_hear: data.howDidYouHear || null,
        inspiration_photo_url: data.inspirationPhotoUrl || null,
        payment_method_id: data.paymentMethodId || null,
        booking_ref: bookingRef,
      })
      .select('id')
      .single()

    if (aptError) throw aptError

    return {
      success: true,
      bookingRef,
      appointmentId: appointment.id,
    }
  } catch (error) {
    console.error('Booking error:', error)
    return {
      success: false,
      error: 'Failed to create booking. Please try again.',
    }
  }
}

export async function uploadInspirationPhoto(formData: FormData) {
  const supabase = await getSupabase()
  const file = formData.get('file') as File

  if (!file) return { url: null, error: 'No file provided' }

  const ext = file.name.split('.').pop()
  const fileName = `inspiration/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('booking-uploads')
    .upload(fileName, file)

  if (error) return { url: null, error: error.message }

  const { data: { publicUrl } } = supabase.storage
    .from('booking-uploads')
    .getPublicUrl(fileName)

  return { url: publicUrl, error: null }
}
