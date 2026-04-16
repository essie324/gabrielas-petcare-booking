'use client'

import { useState } from 'react'
import { Client, Service } from '@/lib/supabase/types'

interface Props {
  existingClient: Client | null
  defaultEmail: string
  defaultPhone: string
  isMeetAndGreet: boolean
  allServices: Service[]
  onSubmit: (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    petName: string
    petType: string
    petBreed: string
    petNotes: string
    numberOfPets: number
    additionalPetsInfo: string
    servicesInterested: string[]
    inspirationPhotoUrl: string | null
  }) => void
  submitting: boolean
}

export default function Step4Details({
  existingClient,
  defaultEmail,
  defaultPhone,
  isMeetAndGreet,
  allServices,
  onSubmit,
  submitting,
}: Props) {
  const [firstName, setFirstName] = useState(existingClient?.first_name || '')
  const [lastName, setLastName] = useState(existingClient?.last_name || '')
  const [email, setEmail] = useState(existingClient?.email || defaultEmail || '')
  const [phone, setPhone] = useState(existingClient?.phone || defaultPhone || '')
  const [address, setAddress] = useState((existingClient as unknown as { address?: string })?.address || '')
  const [petName, setPetName] = useState(existingClient?.pet_name || '')
  const [petType, setPetType] = useState(existingClient?.pet_type || '')
  const [petBreed, setPetBreed] = useState('')
  const [petNotes, setPetNotes] = useState(existingClient?.pet_notes || '')
  const [numberOfPets, setNumberOfPets] = useState(1)
  const [additionalPetsInfo, setAdditionalPetsInfo] = useState('')
  const [servicesInterested, setServicesInterested] = useState<string[]>([])
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

  const toggleService = (name: string) => {
    setServicesInterested(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    )
  }

  // Filter out the Meet & Greet from the interest list
  const bookableServices = allServices.filter(s => s.name !== 'Meet & Greet')

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
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Address</label>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Street address, city, zip"
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
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
                <option value="Rabbit">Rabbit</option>
                <option value="Fish">Fish</option>
                <option value="Reptile">Reptile</option>
                <option value="Hamster/Guinea Pig">Hamster/Guinea Pig</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Breed / Description</label>
            <input
              value={petBreed}
              onChange={e => setPetBreed(e.target.value)}
              placeholder="e.g. Golden Retriever, Tabby mix, 2 year old Cockatiel..."
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
            />
          </div>

          {/* Number of pets */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">How many pets?</label>
            <select
              value={numberOfPets}
              onChange={e => setNumberOfPets(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} pet{n > 1 ? 's' : ''}</option>
              ))}
              <option value={6}>6+</option>
            </select>
          </div>

          {numberOfPets > 1 && (
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Tell us about your other pet{numberOfPets > 2 ? 's' : ''}
              </label>
              <textarea
                value={additionalPetsInfo}
                onChange={e => setAdditionalPetsInfo(e.target.value)}
                rows={3}
                placeholder="Names, breeds, ages, any special needs..."
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition resize-none"
              />
            </div>
          )}

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

        {/* Services interested — only for Meet & Greet */}
        {isMeetAndGreet && bookableServices.length > 0 && (
          <div className="bg-white border border-brand-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider mb-1">
              Services You&apos;re Interested In
            </h3>
            <p className="text-sm text-gray-400 mb-4">Select all that apply so we can discuss during your visit.</p>
            <div className="space-y-2">
              {bookableServices.map(service => (
                <label
                  key={service.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    servicesInterested.includes(service.name)
                      ? 'border-brand-dark bg-brand-surface'
                      : 'border-brand-border hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={servicesInterested.includes(service.name)}
                    onChange={() => toggleService(service.name)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-dark/30"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-brand-dark">{service.name}</span>
                    {service.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{service.description}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 flex-shrink-0">
                    {service.price_cents === 0 ? 'Free' : `$${(service.price_cents / 100).toFixed(0)}`}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

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
            address: address.trim(),
            petName: petName.trim(),
            petType,
            petBreed: petBreed.trim(),
            petNotes: petNotes.trim(),
            numberOfPets,
            additionalPetsInfo: additionalPetsInfo.trim(),
            servicesInterested,
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
