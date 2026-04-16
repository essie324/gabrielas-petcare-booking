const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'Gabriela\'s Pet Care <onboarding@resend.dev>'

interface EmailAttachment {
  filename: string
  content: string
  content_type?: string
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return { success: false, error: 'No API key' }
  }

  try {
    const payload: Record<string, unknown> = {
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }

    if (attachments?.length) {
      payload.attachments = attachments.map(a => ({
        filename: a.filename,
        content: Buffer.from(a.content, 'utf-8').toString('base64'),
        ...(a.content_type ? { content_type: a.content_type } : {}),
      }))
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('Resend error:', err)
      return { success: false, error: err.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: 'Failed to send' }
  }
}

/* ── ICS Calendar Invite Generator ─────────────── */

function pad2(n: number) { return String(n).padStart(2, '0') }

function toICSDateUTC(date: Date): string {
  return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,]/g, c => '\\' + c).replace(/\n/g, '\\n')
}

export function buildICSInvite(data: {
  serviceName: string
  providerName: string
  clientName: string
  petName?: string
  date: string
  time: string
  durationMinutes: number
  bookingRef: string
  location?: string
}): string {
  // Parse as local time, then treat as America/New_York (UTC-4 or UTC-5)
  // Using TZID approach for proper timezone handling
  const dateStr = data.date // YYYY-MM-DD
  const timeStr = data.time // HH:MM
  const localStart = `${dateStr.replace(/-/g, '')}T${timeStr.replace(':', '')}00`
  const startMs = new Date(`${data.date}T${data.time}:00`).getTime()
  const endMs = startMs + data.durationMinutes * 60000
  const endDate = new Date(endMs)
  const endDateStr = `${endDate.getFullYear()}${pad2(endDate.getMonth() + 1)}${pad2(endDate.getDate())}T${pad2(endDate.getHours())}${pad2(endDate.getMinutes())}00`

  const now = new Date()
  const uid = `${data.bookingRef}@gabrielaspremierpetcare.com`
  const location = escapeICS(data.location || 'Orlando\\, FL')
  const summary = escapeICS(`${data.serviceName} - ${data.petName || data.clientName}`)
  const description = escapeICS([
    `Service: ${data.serviceName}`,
    `Provider: ${data.providerName}`,
    data.petName ? `Pet: ${data.petName}` : '',
    `Ref: ${data.bookingRef}`,
  ].filter(Boolean).join('\n'))

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gabrielas Premier Pet Care//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    'TZID:America/New_York',
    'BEGIN:STANDARD',
    'DTSTART:19701101T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0500',
    'TZNAME:EST',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700308T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0400',
    'TZNAME:EDT',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICSDateUTC(now)}`,
    `DTSTART;TZID=America/New_York:${localStart}`,
    `DTEND;TZID=America/New_York:${endDateStr}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'ORGANIZER;CN=Gabrielas Pet Care:mailto:gabrielaspremierpetcare@gmail.com',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Pet care appointment in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function buildGoogleCalendarUrl(data: {
  serviceName: string
  providerName: string
  date: string
  time: string
  durationMinutes: number
  bookingRef: string
  location?: string
}): string {
  const start = new Date(`${data.date}T${data.time}:00`)
  const end = new Date(start.getTime() + data.durationMinutes * 60000)

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const title = encodeURIComponent(`${data.serviceName} - Gabriela's Pet Care`)
  const details = encodeURIComponent(`Provider: ${data.providerName}\nRef: ${data.bookingRef}`)
  const loc = encodeURIComponent(data.location || 'Orlando, FL')

  return `https://calendar.google.com/calendar/r/eventedit?text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${loc}`
}

export function buildClientConfirmationEmail(data: {
  clientName: string
  serviceName: string
  providerName: string
  date: string
  time: string
  durationMinutes: number
  bookingRef: string
  siteUrl: string
  location?: string
}) {
  const dateObj = new Date(data.date + 'T' + data.time + ':00')
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const h = dateObj.getHours(), m = dateObj.getMinutes()
  const formattedTime = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`

  const icsUrl = `${data.siteUrl}/api/calendar?ref=${encodeURIComponent(data.bookingRef)}`
  const googleUrl = buildGoogleCalendarUrl({
    serviceName: data.serviceName,
    providerName: data.providerName,
    date: data.date,
    time: data.time,
    durationMinutes: data.durationMinutes,
    bookingRef: data.bookingRef,
    location: data.location,
  })

  return {
    subject: `Booking Confirmed — ${data.bookingRef}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #f2efe9; padding: 40px 32px; border-radius: 16px;">
        <h1 style="font-size: 24px; color: #0e0e0e; margin: 0 0 8px;">You're All Set!</h1>
        <p style="color: #666; margin: 0 0 24px;">Your appointment has been confirmed.</p>

        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid rgba(0,0,0,0.08);">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #0e0e0e; font-weight: 600; text-align: right; font-size: 14px;">${data.serviceName}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #0e0e0e; font-weight: 600; text-align: right; font-size: 14px;">${formattedDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #0e0e0e; font-weight: 600; text-align: right; font-size: 14px;">${formattedTime}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Provider</td><td style="padding: 8px 0; color: #0e0e0e; font-weight: 600; text-align: right; font-size: 14px;">${data.providerName}</td></tr>
          </table>
          <div style="border-top: 1px solid rgba(0,0,0,0.08); margin-top: 16px; padding-top: 16px; text-align: center;">
            <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Booking Reference</p>
            <p style="font-size: 22px; font-weight: bold; color: #0e0e0e; margin: 0;">${data.bookingRef}</p>
          </div>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <p style="color: #888; font-size: 13px; margin: 0 0 12px;">Add this appointment to your calendar:</p>
          <a href="${googleUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #0e0e0e; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; margin: 0 4px 8px;">Google Calendar</a>
          <a href="${icsUrl}" style="display: inline-block; padding: 10px 20px; background: #0e0e0e; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; margin: 0 4px 8px;">Apple / Outlook</a>
        </div>

        <p style="color: #888; font-size: 13px; text-align: center; margin: 24px 0 0;">We can't wait to meet your pet! 🐾</p>
        <p style="color: #aaa; font-size: 12px; text-align: center; margin: 8px 0 0;">Gabriela's Premier Pet Care · Orlando, FL</p>
      </div>
    `,
  }
}

interface PetEntry {
  name: string
  type: string
  breed: string
  allergies: string
  healthNotes: string
}

export function buildStaffNotificationEmail(data: {
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  pets: PetEntry[]
  additionalNotes: string
  servicesInterested: string[]
  serviceName: string
  providerName: string
  date: string
  time: string
  bookingRef: string
}) {
  const dateObj = new Date(data.date + 'T' + data.time + ':00')
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const h = dateObj.getHours(), m = dateObj.getMinutes()
  const formattedTime = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`

  return {
    subject: `New Booking: ${data.clientName} — ${formattedDate} at ${formattedTime}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #f2efe9; padding: 40px 32px; border-radius: 16px;">
        <h1 style="font-size: 22px; color: #0e0e0e; margin: 0 0 4px;">New Booking 📋</h1>
        <p style="color: #666; margin: 0 0 24px; font-size: 14px;">Assigned to ${data.providerName}</p>

        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid rgba(0,0,0,0.08); margin-bottom: 16px;">
          <h3 style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Appointment</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #888; font-size: 14px;">Service</td><td style="padding: 6px 0; color: #0e0e0e; font-weight: 600; text-align: right; font-size: 14px;">${data.serviceName}</td></tr>
            <tr><td style="padding: 6px 0; color: #888; font-size: 14px;">Date</td><td style="padding: 6px 0; color: #0e0e0e; font-weight: 600; text-align: right; font-size: 14px;">${formattedDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #888; font-size: 14px;">Time</td><td style="padding: 6px 0; color: #0e0e0e; font-weight: 600; text-align: right; font-size: 14px;">${formattedTime}</td></tr>
            <tr><td style="padding: 6px 0; color: #888; font-size: 14px;">Ref</td><td style="padding: 6px 0; color: #0e0e0e; font-weight: 600; text-align: right; font-size: 14px;">${data.bookingRef}</td></tr>
          </table>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid rgba(0,0,0,0.08); margin-bottom: 16px;">
          <h3 style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Client</h3>
          <p style="color: #0e0e0e; font-weight: 600; margin: 0 0 4px;">${data.clientName}</p>
          ${data.clientEmail ? `<p style="color: #666; font-size: 14px; margin: 0 0 2px;">${data.clientEmail}</p>` : ''}
          ${data.clientPhone ? `<p style="color: #666; font-size: 14px; margin: 0 0 2px;">${data.clientPhone}</p>` : ''}
          ${data.clientAddress ? `<p style="color: #666; font-size: 14px; margin: 0 0 2px;">📍 ${data.clientAddress}</p>` : ''}
        </div>

        ${data.pets.length > 0 ? `
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid rgba(0,0,0,0.08); margin-bottom: 16px;">
          <h3 style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">
            ${data.pets.length > 1 ? `Pets (${data.pets.length})` : 'Pet'}
          </h3>
          ${data.pets.map((pet, i) => `
            <div style="${i > 0 ? 'border-top: 1px solid rgba(0,0,0,0.06); margin-top: 12px; padding-top: 12px;' : ''}">
              ${pet.name ? `<p style="color: #0e0e0e; font-weight: 600; margin: 0 0 4px;">${pet.name}${pet.type ? ` (${pet.type})` : ''}</p>` : ''}
              ${pet.breed ? `<p style="color: #666; font-size: 14px; margin: 0 0 2px;">Breed: ${pet.breed}</p>` : ''}
              ${pet.allergies ? `<p style="color: #c44; font-size: 14px; margin: 0 0 2px;">⚠️ Allergies: ${pet.allergies}</p>` : ''}
              ${pet.healthNotes ? `<p style="color: #666; font-size: 14px; margin: 0;">Health: ${pet.healthNotes}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${data.additionalNotes ? `
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid rgba(0,0,0,0.08); margin-bottom: 16px;">
          <h3 style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Additional Notes</h3>
          <p style="color: #666; font-size: 14px; margin: 0; white-space: pre-line;">${data.additionalNotes}</p>
        </div>
        ` : ''}

        ${data.servicesInterested.length > 0 ? `
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid rgba(0,0,0,0.08);">
          <h3 style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Services Interested In</h3>
          ${data.servicesInterested.map(s => `<p style="color: #0e0e0e; font-size: 14px; margin: 0 0 4px;">• ${s}</p>`).join('')}
        </div>
        ` : ''}

        <p style="color: #aaa; font-size: 12px; text-align: center; margin: 24px 0 0;">Gabriela's Premier Pet Care · Staff Notification</p>
      </div>
    `,
  }
}
