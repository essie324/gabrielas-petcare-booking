'use client'

import { Service, Provider } from '@/lib/supabase/types'

interface Props {
  bookingRef: string
  service: Service
  provider: Provider | null
  date: string
  time: string
  clientName: string
}

export default function Step5Confirmation({
  bookingRef,
  service,
  provider,
  date,
  time,
  clientName,
}: Props) {
  const dateObj = new Date(date + 'T' + time + ':00')
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()
  const h12 = hours % 12 || 12
  const ampm = hours < 12 ? 'AM' : 'PM'
  const formattedTime = `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`

  return (
    <div className="max-w-md mx-auto text-center">
      {/* Success icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="font-heading text-3xl sm:text-4xl text-brand-dark mb-2">
        You&apos;re All Set!
      </h2>
      <p className="text-gray-500 mb-8">
        Your appointment has been confirmed.
      </p>

      {/* Summary card */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 text-left space-y-4">
        {/* Provider */}
        {provider && (
          <div className="flex items-center gap-3 pb-4 border-b border-brand-border">
            <div className="w-12 h-12 rounded-full bg-brand-surface overflow-hidden flex-shrink-0">
              {provider.profile_photo_url ? (
                <img
                  src={provider.profile_photo_url}
                  alt={provider.first_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-violet text-lg font-heading font-bold">
                  {provider.first_name[0]}
                </div>
              )}
            </div>
            <div>
              <p className="text-brand-dark font-medium">
                {provider.first_name} {provider.last_name}
              </p>
              <p className="text-sm text-gray-400">Your provider</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Service</span>
            <span className="text-brand-dark font-medium text-sm">{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Date</span>
            <span className="text-brand-dark font-medium text-sm">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Time</span>
            <span className="text-brand-dark font-medium text-sm">{formattedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Duration</span>
            <span className="text-brand-dark font-medium text-sm">{service.duration_minutes} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Price</span>
            <span className="text-brand-dark font-medium text-sm">
              {service.price_cents === 0 ? 'Free' : `$${(service.price_cents / 100).toFixed(0)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Client</span>
            <span className="text-brand-dark font-medium text-sm">{clientName}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-brand-border text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Booking Reference</p>
          <p className="text-brand-dark font-heading text-2xl font-bold tracking-wide">{bookingRef}</p>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-6">
        A confirmation has been sent to your email. We can&apos;t wait to meet your pet! 🐾
      </p>

      <a
        href="/"
        className="inline-block mt-6 px-8 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-violet transition"
      >
        Back to Home
      </a>
    </div>
  )
}
