'use client'

import { useState } from 'react'
import { Client, Service } from '@/lib/supabase/types'

interface PetEntry {
  name: string
  type: string
  breed: string
  allergies: string
  healthNotes: string
}

function emptyPet(): PetEntry {
  return { name: '', type: '', breed: '', allergies: '', healthNotes: '' }
}

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Reptile', 'Hamster/Guinea Pig', 'Other']

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
    pets: PetEntry[]
    additionalNotes: string
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

  const [pets, setPets] = useState<PetEntry[]>([{
    name: existingClient?.pet_name || '',
    type: existingClient?.pet_type || '',
    breed: '',
    allergies: '',
    healthNotes: '',
  }])

  const [additionalNotes, setAdditionalNotes] = useState('')
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

  const updatePet = (index: number, field: keyof PetEntry, value: string) => {
    setPets(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  const addPet = () => setPets(prev => [...prev, emptyPet()])

  const removePet = (index: number) => {
    if (pets.length <= 1) return
    setPets(prev => prev.filter((_, i) => i !== index))
  }

  const toggleService = (name: string) => {
    setServicesInterested(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    )
  }

  const bookableServices = allServices.filter(s => s.name !== 'Meet & Greet')
  const isValid = firstName.trim() && lastName.trim() && (email.trim() || phone.trim())

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition'
  const placeholderClass = inputClass + ' placeholder:text-gray-300'

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-heading text-3xl sm:text-4xl text-brand-dark mb-2 text-center">
        Your Details
      </h2>
      <p className="text-gray-500 text-center mb-8">
        {existingClient ? 'Confirm your info.' : 'Tell us about you and your pet.'}
      </p>

      <div className="space-y-4">
        {/* ── Contact ── */}
        <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider">Contact</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">First name *</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Last name *</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address, city, zip" className={placeholderClass} />
          </div>
        </div>

        {/* ── Pets ── */}
        {pets.map((pet, idx) => (
          <div key={idx} className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider">
                {pets.length === 1 ? 'Pet Info' : `Pet ${idx + 1}`}
              </h3>
              {pets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePet(idx)}
                  className="text-xs text-red-400 hover:text-red-600 transition"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Name</label>
                <input value={pet.name} onChange={e => updatePet(idx, 'name', e.target.value)} placeholder="e.g. Luna" className={placeholderClass} />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Type</label>
                <select value={pet.type} onChange={e => updatePet(idx, 'type', e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {PET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Breed / Description</label>
              <input value={pet.breed} onChange={e => updatePet(idx, 'breed', e.target.value)}
                placeholder="e.g. Golden Retriever, Tabby mix, 2 year old Cockatiel..."
                className={placeholderClass} />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Allergies</label>
              <input value={pet.allergies} onChange={e => updatePet(idx, 'allergies', e.target.value)}
                placeholder="Food allergies, environmental sensitivities..."
                className={placeholderClass} />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Health / Medical Notes</label>
              <textarea value={pet.healthNotes} onChange={e => updatePet(idx, 'healthNotes', e.target.value)}
                rows={2}
                placeholder="Medications, conditions, vet info, temperament..."
                className={placeholderClass + ' resize-none'} />
            </div>
          </div>
        ))}

        {/* Add pet button */}
        <button
          type="button"
          onClick={addPet}
          className="w-full py-3 border-2 border-dashed border-brand-border rounded-2xl text-sm text-gray-500 hover:border-brand-dark hover:text-brand-dark hover:bg-brand-surface/50 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Pet
        </button>

        {/* ── Anything Else ── */}
        <div className="bg-white border border-brand-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider mb-1">
            Anything Else?
          </h3>
          <p className="text-sm text-gray-400 mb-3">Share anything you&apos;d like us to know.</p>
          <textarea
            value={additionalNotes}
            onChange={e => setAdditionalNotes(e.target.value)}
            rows={3}
            placeholder="Special requests, questions, household info, emergency contacts..."
            className={placeholderClass + ' resize-none'}
          />
        </div>

        {/* ── Services Interested (Meet & Greet only) ── */}
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

        {/* ── Photo Upload ── */}
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
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>

        {/* ── Submit ── */}
        <button
          onClick={() => onSubmit({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            pets,
            additionalNotes: additionalNotes.trim(),
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
