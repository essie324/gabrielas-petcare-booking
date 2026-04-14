'use client'

import { useState } from 'react'
import { Client } from '@/lib/supabase/types'

interface Props {
  existingClient: Client | null
  defaultEmail: string
  defaultPhone: string
  onSubmit: (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    petName: string
    petType: string
    petNotes: string
    inspirationPhotoUrl: string | null
  }) => void
  submitting: boolean
}

export default function Step4Details({
  existingClient,
  defaultEmail,
  defaultPhone,
  onSubmit,
  submitting,
}: Props) {
  const [firstName, setFirstName] = useState(existingClient?.first_name || '')
  const [lastName, setLastName] = useState(existingClient?.last_name || '')
  const [email, setEmail] = useState(existingClient?.email || defaultEmail || '')
  const [phone, setPhone] = useState(existingClient?.phone || defaultPhone || '')
  const [petName, setPetName] = useState(existingClient?.pet_name || '')
  const [petType, setPetType] = useState(existingClient?.pet_type || '')
  const [petNotes, setPetNotes] = useState(existingClient?.pet_notes || '')
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/booking/upload-photo', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setPhotoUrl(data.url)
    } catch {
      // silent fail
    } finally {
      setUploading(false)
    }
  }

  const isValid = firstName.trim() && lastName.trim() && (email.trim() || phone.trim())

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-heading text-3xl sm:text-4xl text-brand-dark mb-2 text-center">
        Your Details
      </h2>
      <p className="text-gray-500 text-center mb-8">
        {existingClient ? 'Confirm your info.' : 'Tell us about you and your pet.'}
      </p>

      <div className="space-y-4">
        {/* Contact info */}
        <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider">Contact</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">First name *</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Last name *</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
            />
          </div>
        </div>

        {/* Pet info */}
        <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider">Pet Info</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Pet name</label>
              <input
                value={petName}
                onChange={e => setPetName(e.target.value)}
                placeholder="e.g. Luna"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Type</label>
              <select
                value={petType}
                onChange={e => setPetType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
              >
                <option value="">Select...</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Special notes or instructions</label>
            <textarea
              value={petNotes}
              onChange={e => setPetNotes(e.target.value)}
              rows={3}
              placeholder="Allergies, medications, temperament, favorite toys..."
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition resize-none"
            />
          </div>
        </div>

        {/* Photo upload */}
        <div className="bg-white border border-brand-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider mb-3">
            Photo (optional)
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Upload a photo of your pet so we know who to expect!
          </p>
          <label className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-brand-border rounded-xl cursor-pointer hover:border-brand-dark hover:bg-brand-surface/50 transition">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : photoUrl ? 'Photo uploaded ✓' : 'Choose photo'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={() => onSubmit({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            petName: petName.trim(),
            petType,
            petNotes: petNotes.trim(),
            inspirationPhotoUrl: photoUrl,
          })}
          disabled={!isValid || submitting}
          className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium text-lg hover:bg-[#2a2a2a] transition disabled:opacity-40"
        >
          {submitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )
}
