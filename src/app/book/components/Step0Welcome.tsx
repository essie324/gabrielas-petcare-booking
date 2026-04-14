'use client'

import { useState } from 'react'
import { Client } from '@/lib/supabase/types'

interface Props {
  onContinue: (data: {
    existingClient: Client | null
    isNewClient: boolean
    isFirstVisit: boolean | null
    howDidYouHear: string | null
    referredByName: string | null
    email: string
    phone: string
  }) => void
}

export default function Step0Welcome({ onContinue }: Props) {
  const [lookupValue, setLookupValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [lookedUp, setLookedUp] = useState(false)
  const [client, setClient] = useState<Client | null>(null)
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null)
  const [howDidYouHear, setHowDidYouHear] = useState<string | null>(null)
  const [referredByName, setReferredByName] = useState('')

  const handleLookup = async () => {
    if (!lookupValue.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/booking/lookup-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: lookupValue.trim() }),
      })
      const data = await res.json()
      setClient(data.client)
      setLookedUp(true)
    } catch {
      setLookedUp(true)
      setClient(null)
    } finally {
      setLoading(false)
    }
  }

  const hearOptions = ['Friend referral', 'Instagram', 'Google', 'Walk-by', 'Other']

  const canContinue = lookedUp && (
    client !== null ||
    (isFirstVisit !== null && (
      !isFirstVisit || (howDidYouHear !== null && (howDidYouHear !== 'Friend referral' || true))
    ))
  )

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="font-heading text-3xl sm:text-4xl text-brand-dark mb-3">
        Welcome
      </h2>
      <p className="text-gray-500 mb-8">
        Let&apos;s get you booked. Enter your email or phone to get started.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Email or phone number"
          value={lookupValue}
          onChange={e => { setLookupValue(e.target.value); setLookedUp(false) }}
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
          className="flex-1 px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
        />
        <button
          onClick={handleLookup}
          disabled={loading || !lookupValue.trim()}
          className="px-6 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-[#2a2a2a] transition disabled:opacity-40"
        >
          {loading ? '...' : 'Go'}
        </button>
      </div>

      {/* Returning client greeting */}
      {lookedUp && client && (
        <div className="bg-brand-surface rounded-2xl p-6 text-left animate-in fade-in">
          <p className="text-brand-dark text-lg font-heading font-semibold">
            Welcome back, {client.first_name}! 🐾
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Great to see you again. Let&apos;s book your next visit.
          </p>
          <button
            onClick={() => onContinue({
              existingClient: client,
              isNewClient: false,
              isFirstVisit: false,
              howDidYouHear: null,
              referredByName: null,
              email: client.email || '',
              phone: client.phone || '',
            })}
            className="mt-4 w-full py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-[#2a2a2a] transition"
          >
            Continue Booking
          </button>
        </div>
      )}

      {/* New client onboarding */}
      {lookedUp && !client && (
        <div className="bg-brand-surface rounded-2xl p-6 text-left space-y-5 animate-in fade-in">
          <p className="text-brand-dark font-heading text-lg font-semibold">
            Welcome! We&apos;re happy to meet you.
          </p>

          <div>
            <p className="text-sm text-gray-600 mb-2">Is this your first visit?</p>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => setIsFirstVisit(val)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition ${
                    isFirstVisit === val
                      ? 'bg-brand-dark text-white border-brand-dark'
                      : 'bg-white text-brand-dark border-brand-border hover:border-brand-dark'
                  }`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {isFirstVisit && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">How did you hear about us?</p>
              <div className="grid grid-cols-2 gap-2">
                {hearOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setHowDidYouHear(opt)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition ${
                      howDidYouHear === opt
                        ? 'bg-brand-dark text-white border-brand-dark'
                        : 'bg-white text-brand-dark border-brand-border hover:border-brand-dark'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {howDidYouHear === 'Friend referral' && (
                <div>
                  <label className="text-sm text-gray-600">Who can we thank? (optional)</label>
                  <input
                    type="text"
                    value={referredByName}
                    onChange={e => setReferredByName(e.target.value)}
                    placeholder="Their name"
                    className="mt-1 w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
                  />
                </div>
              )}
            </div>
          )}

          {canContinue && (
            <button
              onClick={() => onContinue({
                existingClient: null,
                isNewClient: true,
                isFirstVisit,
                howDidYouHear,
                referredByName: referredByName || null,
                email: lookupValue.includes('@') ? lookupValue : '',
                phone: !lookupValue.includes('@') ? lookupValue : '',
              })}
              className="w-full py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-[#2a2a2a] transition"
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  )
}
