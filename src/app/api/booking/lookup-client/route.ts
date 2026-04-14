import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { value } = await req.json()

  if (!value || value.trim().length < 3) {
    return NextResponse.json({ client: null })
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

  const trimmed = value.trim()

  // Try email first
  if (trimmed.includes('@')) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('email', trimmed.toLowerCase())
      .limit(1)
      .single()
    return NextResponse.json({ client: data || null })
  }

  // Try phone
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length >= 10) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', digits)
      .limit(1)
      .single()
    return NextResponse.json({ client: data || null })
  }

  return NextResponse.json({ client: null })
}
