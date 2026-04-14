import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const providerId = searchParams.get('providerId')
  const month = searchParams.get('month') // YYYY-MM
  const serviceDuration = parseInt(searchParams.get('duration') || '30')

  if (!providerId || !month) {
    return NextResponse.json({ error: 'Missing providerId or month' }, { status: 400 })
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

  // Get provider working hours
  const { data: workingHours } = await supabase
    .from('provider_working_hours')
    .select('*')
    .eq('provider_id', providerId)

  if (!workingHours) {
    return NextResponse.json({ availableDays: [] })
  }

  // Get existing appointments for the month
  const startOfMonth = `${month}-01T00:00:00Z`
  const [year, mo] = month.split('-').map(Number)
  const endOfMonth = new Date(year, mo, 0, 23, 59, 59).toISOString()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('starts_at, ends_at')
    .eq('provider_id', providerId)
    .eq('status', 'confirmed')
    .gte('starts_at', startOfMonth)
    .lte('starts_at', endOfMonth)

  // Calculate available days
  const availableDays: string[] = []
  const daysInMonth = new Date(year, mo, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, mo - 1, day)
    if (date < today) continue

    const dayOfWeek = date.getDay()
    const wh = workingHours.find(h => h.day_of_week === dayOfWeek && h.is_working)
    if (!wh) continue

    // Check if there's at least one slot available
    const [startH, startM] = wh.start_time.split(':').map(Number)
    const [endH, endM] = wh.end_time.split(':').map(Number)
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM)
    const slotsNeeded = Math.ceil(serviceDuration / 30)
    const totalSlots = Math.floor(totalMinutes / 30)

    const dateStr = `${year}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayAppointments = (appointments || []).filter(a =>
      a.starts_at.startsWith(dateStr)
    )

    if (dayAppointments.length < totalSlots) {
      availableDays.push(dateStr)
    }
  }

  return NextResponse.json({ availableDays })
}
