'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendEmail, buildClientConfirmationEmail, buildStaffNotificationEmail, buildICSInvite } from '@/lib/email'

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
  address: string
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
          address: data.address || null,
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
          address: data.address || undefined,
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

    // Get service and provider names for emails
    const { data: service } = await supabase.from('services').select('name, duration_minutes').eq('id', data.serviceId).single()
    const { data: provider } = await supabase.from('providers').select('first_name, last_name, email').eq('id', data.providerId).single()

    const serviceName = service?.name || 'Pet Care'
    const providerName = provider ? `${provider.first_name} ${provider.last_name}` : 'Staff'
    const durationMinutes = service?.duration_minutes || data.serviceDuration

    // Generate ICS calendar invite
    const icsContent = buildICSInvite({
      serviceName,
      providerName,
      clientName: `${data.firstName} ${data.lastName}`,
      petName: data.petName || undefined,
      date: data.date,
      time: data.time,
      durationMinutes,
      bookingRef,
      location: data.address || undefined,
    })
    const icsAttachment = [{ filename: `appointment-${bookingRef}.ics`, content: icsContent }]

    // Send client confirmation email with calendar invite
    if (data.email) {
      const clientEmail = buildClientConfirmationEmail({
        clientName: `${data.firstName} ${data.lastName}`,
        serviceName,
        providerName,
        date: data.date,
        time: data.time,
        bookingRef,
      })
      sendEmail({ to: data.email, ...clientEmail, attachments: icsAttachment }).catch(console.error)
    }

    // Send staff notification emails with calendar invite
    const { data: allProviders } = await supabase.from('providers').select('email, first_name').eq('active', true)
    const staffEmails = (allProviders || []).filter(p => p.email).map(p => p.email as string)

    const staffNotification = buildStaffNotificationEmail({
      clientName: `${data.firstName} ${data.lastName}`,
      clientEmail: data.email,
      clientPhone: data.phone,
      clientAddress: data.address,
      petName: data.petName,
      petType: data.petType,
      petNotes: data.petNotes,
      serviceName,
      providerName,
      date: data.date,
      time: data.time,
      bookingRef,
    })

    for (const email of staffEmails) {
      sendEmail({ to: email, ...staffNotification, attachments: icsAttachment }).catch(console.error)
    }

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
