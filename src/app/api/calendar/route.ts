import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { buildICSInvite } from '@/lib/email'

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'Missing ref' }, { status: 400 })

  const cookieStore = await cookies()
  const supabase = createServerClient(
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

  const { data: apt } = await supabase
    .from('appointments')
    .select('*, clients(*), providers(first_name, last_name), services(name, duration_minutes)')
    .eq('booking_ref', ref)
    .single()

  if (!apt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const startsAt = new Date(apt.starts_at)
  const date = `${startsAt.getFullYear()}-${String(startsAt.getMonth() + 1).padStart(2, '0')}-${String(startsAt.getDate()).padStart(2, '0')}`
  const time = `${String(startsAt.getHours()).padStart(2, '0')}:${String(startsAt.getMinutes()).padStart(2, '0')}`

  const ics = buildICSInvite({
    serviceName: apt.services?.name || 'Pet Care',
    providerName: apt.providers ? `${apt.providers.first_name} ${apt.providers.last_name}` : 'Staff',
    clientName: apt.clients ? `${apt.clients.first_name} ${apt.clients.last_name}` : 'Client',
    petName: apt.clients?.pet_name || undefined,
    date,
    time,
    durationMinutes: apt.services?.duration_minutes || 30,
    bookingRef: apt.booking_ref,
    location: apt.clients?.address || undefined,
  })

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="appointment-${ref}.ics"`,
    },
  })
}
