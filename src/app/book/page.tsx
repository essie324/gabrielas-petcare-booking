'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Service, Provider, Client } from '@/lib/supabase/types'
import { bookAppointmentFromFlow } from './actions'
import ProgressBar from './components/ProgressBar'
import StepWrapper from './components/StepWrapper'
import Step0Welcome from './components/Step0Welcome'
import Step1Service from './components/Step1Service'
import Step2Provider from './components/Step2Provider'
import Step3DateTime from './components/Step3DateTime'
import Step4Details from './components/Step4Details'
import Step5Confirmation from './components/Step5Confirmation'

export default function BookPage() {
  const [step, setStep] = useState(0)
  const [services, setServices] = useState<Service[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Booking state
  const [existingClient, setExistingClient] = useState<Client | null>(null)
  const [isNewClient, setIsNewClient] = useState(true)
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null)
  const [howDidYouHear, setHowDidYouHear] = useState<string | null>(null)
  const [referredByName, setReferredByName] = useState<string | null>(null)
  const [defaultEmail, setDefaultEmail] = useState('')
  const [defaultPhone, setDefaultPhone] = useState('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [bookWithAnyone, setBookWithAnyone] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [bookingRef, setBookingRef] = useState('')

  // Load services and providers
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: svc }, { data: prov }] = await Promise.all([
        supabase.from('services').select('*').eq('active', true).order('sort_order'),
        supabase.from('providers').select('*').eq('active', true),
      ])
      setServices((svc as Service[]) || [])
      setProviders((prov as Provider[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  // Get effective provider ID for calendar
  const effectiveProviderId = bookWithAnyone
    ? providers.find(p => p.booking_status === 'accepting_all')?.id || providers[0]?.id
    : selectedProvider?.id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-dark border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-heading text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="py-6 border-b border-brand-border/50">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <a href="/" className="font-heading text-xl text-brand-dark font-semibold">
            Gabriela&apos;s Premier Pet Care
          </a>
          {step > 0 && step < 5 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-sm text-brand-dark hover:text-[#2a2a2a] transition flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <ProgressBar currentStep={step} />

        <StepWrapper stepKey={step}>
          {step === 0 && (
            <Step0Welcome
              onContinue={(data) => {
                setExistingClient(data.existingClient)
                setIsNewClient(data.isNewClient)
                setIsFirstVisit(data.isFirstVisit)
                setHowDidYouHear(data.howDidYouHear)
                setReferredByName(data.referredByName)
                setDefaultEmail(data.email)
                setDefaultPhone(data.phone)
                setStep(1)
              }}
            />
          )}

          {step === 1 && (
            <Step1Service
              services={services}
              onSelect={(service) => {
                setSelectedService(service)
                setStep(2)
              }}
            />
          )}

          {step === 2 && (
            <Step2Provider
              providers={providers}
              isNewClient={isNewClient}
              onSelect={(provider, anyone) => {
                setSelectedProvider(provider)
                setBookWithAnyone(anyone)
                setStep(3)
              }}
            />
          )}

          {step === 3 && effectiveProviderId && selectedService && (
            <Step3DateTime
              providerId={effectiveProviderId}
              serviceDuration={selectedService.duration_minutes}
              onSelect={(date, time) => {
                setSelectedDate(date)
                setSelectedTime(time)
                setStep(4)
              }}
            />
          )}

          {step === 4 && selectedService && selectedDate && selectedTime && (
            <Step4Details
              existingClient={existingClient}
              defaultEmail={defaultEmail}
              defaultPhone={defaultPhone}
              isMeetAndGreet={selectedService.name === 'Meet & Greet'}
              allServices={services}
              submitting={submitting}
              onSubmit={async (details) => {
                setSubmitting(true)
                const providerId = bookWithAnyone
                  ? providers.find(p => p.booking_status === 'accepting_all')?.id || providers[0]?.id
                  : selectedProvider?.id

                if (!providerId) return

                // Primary pet from first entry
                const primaryPet = details.pets[0] || { name: '', type: '', breed: '', allergies: '', healthNotes: '' }

                // Build comprehensive pet notes
                const noteParts: string[] = []
                details.pets.forEach((pet, i) => {
                  const label = details.pets.length > 1 ? `Pet ${i + 1}: ` : ''
                  const parts: string[] = []
                  if (pet.breed) parts.push(`Breed: ${pet.breed}`)
                  if (pet.allergies) parts.push(`Allergies: ${pet.allergies}`)
                  if (pet.healthNotes) parts.push(`Health: ${pet.healthNotes}`)
                  if (parts.length > 0 || (details.pets.length > 1 && pet.name)) {
                    noteParts.push(`${label}${pet.name || 'Unnamed'}${pet.type ? ` (${pet.type})` : ''}\n${parts.join('\n')}`)
                  }
                })
                if (details.additionalNotes) noteParts.push(`Notes: ${details.additionalNotes}`)

                const result = await bookAppointmentFromFlow({
                  existingClientId: existingClient?.id || null,
                  firstName: details.firstName,
                  lastName: details.lastName,
                  email: details.email,
                  phone: details.phone,
                  address: details.address,
                  petName: primaryPet.name,
                  petType: primaryPet.type,
                  petNotes: noteParts.join('\n\n'),
                  numberOfPets: details.pets.length,
                  servicesInterested: details.servicesInterested,
                  pets: details.pets,
                  additionalNotes: details.additionalNotes,
                  serviceId: selectedService.id,
                  providerId,
                  date: selectedDate,
                  time: selectedTime,
                  serviceDuration: selectedService.duration_minutes,
                  referredByName,
                  howDidYouHear,
                  inspirationPhotoUrl: details.inspirationPhotoUrl,
                  paymentMethodId: null,
                  isFirstVisit: isFirstVisit || false,
                })

                setSubmitting(false)
                if (result.success && result.bookingRef) {
                  setBookingRef(result.bookingRef)
                  setClientName(`${details.firstName} ${details.lastName}`)
                  setStep(5)
                } else {
                  alert(result.error || 'Something went wrong. Please try again.')
                }
              }}
            />
          )}

          {step === 5 && selectedService && (
            <Step5Confirmation
              bookingRef={bookingRef}
              service={selectedService}
              provider={selectedProvider}
              date={selectedDate!}
              time={selectedTime!}
              clientName={clientName}
            />
          )}
        </StepWrapper>
      </main>
    </div>
  )
}
