const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'Gabriela\'s Pet Care <onboarding@resend.dev>'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: { filename: string; content: string }[]
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
        content: Buffer.from(a.content).toString('base64'),
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

function toICSDate(date: Date): string {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}T${pad2(date.getHours())}${pad2(date.getMinutes())}00`
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
  const start = new Date(`${data.date}T${data.time}:00`)
  const end = new Date(start.getTime() + data.durationMinutes * 60000)
  const now = new Date()
  const uid = `${data.bookingRef}@gabrielaspremierpetcare.com`
  const location = data.location || 'Orlando, FL'
  const description = [
    `Service: ${data.serviceName}`,
    `Provider: ${data.providerName}`,
    data.petName ? `Pet: ${data.petName}` : '',
    `Ref: ${data.bookingRef}`,
  ].filter(Boolean).join('\\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gabrielas Premier Pet Care//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(now)}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${data.serviceName} — ${data.petName || data.clientName}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    `ORGANIZER;CN=Gabriela's Pet Care:mailto:gabrielaspremierpetcare@gmail.com`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Pet care appointment in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function buildClientConfirmationEmail(data: {
  clientName: string
  serviceName: string
  providerName: string
  date: string
  time: string
  bookingRef: string
}) {
  const dateObj = new Date(data.date + 'T' + data.time + ':00')
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const h = dateObj.getHours(), m = dateObj.getMinutes()
  const formattedTime = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`

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

        <p style="color: #888; font-size: 13px; text-align: center; margin: 24px 0 0;">We can't wait to meet your pet! 🐾</p>
        <p style="color: #aaa; font-size: 12px; text-align: center; margin: 8px 0 0;">Gabriela's Premier Pet Care · Orlando, FL</p>
      </div>
    `,
  }
}

export function buildStaffNotificationEmail(data: {
  clientName: string
  clientEmail: string
  clientPhone: string
  petName: string
  petType: string
  petNotes: string
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
        </div>

        ${data.petName || data.petType ? `
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid rgba(0,0,0,0.08);">
          <h3 style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Pet</h3>
          ${data.petName ? `<p style="color: #0e0e0e; font-weight: 600; margin: 0 0 4px;">${data.petName}</p>` : ''}
          ${data.petType ? `<p style="color: #666; font-size: 14px; margin: 0 0 4px;">${data.petType}</p>` : ''}
          ${data.petNotes ? `<p style="color: #666; font-size: 14px; margin: 0;">${data.petNotes}</p>` : ''}
        </div>
        ` : ''}

        <p style="color: #aaa; font-size: 12px; text-align: center; margin: 24px 0 0;">Gabriela's Premier Pet Care · Staff Notification</p>
      </div>
    `,
  }
}
