import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const providerId = searchParams.get('providerId')
  const date = searchParams.get('date') // YYYY-MM-DD
  const serviceDuration = parseInt(searchParams.get('duration') || '30')

  if (!providerId || !date) {
    return NextResponse.json({ error: 'Missing providerId or date' }, { status: 400 })
  }

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

  const dateObj = new Date(date + 'T00:00:00')
  const dayOfWeek = dateObj.getDay()

  // Get working hours for this day
  const { data: workingHours } = await supabase
    .from('provider_working_hours')
    .select('*')
    .eq('provider_id', providerId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_working', true)
    .limit(1)
    .single()

  if (!workingHours) {
    return NextResponse.json({ slots: [] })
  }

  // Get existing appointments for this date
  const dayStart = `${date}T00:00:00Z`
  const dayEnd = `${date}T23:59:59Z`

  const { data: appointments } = await supabase
    .from('appointments')
    .select('starts_at, ends_at')
    .eq('provider_id', providerId)
    .eq('status', 'confirmed')
    .gte('starts_at', dayStart)
    .lte('starts_at', dayEnd)

  // Generate time slots
  const [startH, startM] = workingHours.start_time.split(':').map(Number)
  const [endH, endM] = workingHours.end_time.split(':').map(Number)
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  interface TimeSlot {
    time: string
    label: string
    period: 'morning' | 'afternoon' | 'evening'
    available: boolean
  }

  const slots: TimeSlot[] = []
  const now = new Date()

  for (let mins = startMinutes; mins + serviceDuration <= endMinutes; mins += 30) {
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    // Check if slot is in the past
    const slotDate = new Date(date + `T${timeStr}:00`)
    if (slotDate <= now) continue

    // Check for conflicts with existing appointments
    const slotStart = new Date(`${date}T${timeStr}:00Z`)
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)

    const hasConflict = (appointments || []).some(apt => {
      const aptStart = new Date(apt.starts_at)
      const aptEnd = new Date(apt.ends_at)
      return slotStart < aptEnd && slotEnd > aptStart
    })

    // Determine period
    let period: 'morning' | 'afternoon' | 'evening' = 'morning'
    if (hours >= 17) period = 'evening'
    else if (hours >= 12) period = 'afternoon'

    // Format label
    const h12 = hours % 12 || 12
    const ampm = hours < 12 ? 'AM' : 'PM'
    const label = `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`

    slots.push({
      time: timeStr,
      label,
      period,
      available: !hasConflict,
    })
  }

  return NextResponse.json({ slots })
}
