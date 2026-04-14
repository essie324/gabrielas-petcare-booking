export interface Service {
  id: string
  name: string
  duration_minutes: number
  price_cents: number
  category: string
  description: string | null
  sort_order: number
  active: boolean
}

export interface Provider {
  id: string
  first_name: string
  last_name: string
  email: string | null
  bio: string | null
  specialty_tags: string[]
  profile_photo_url: string | null
  calendar_color: string
  booking_status: 'accepting_all' | 'referral_only' | 'closed'
  active: boolean
}

export interface Client {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  pet_name: string | null
  pet_type: string | null
  pet_notes: string | null
  payment_method_id: string | null
  payment_customer_id: string | null
}

export interface Appointment {
  id: string
  client_id: string
  provider_id: string
  service_id: string
  starts_at: string
  ends_at: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  referred_by_name: string | null
  how_did_you_hear: string | null
  inspiration_photo_url: string | null
  payment_method_id: string | null
  notes: string | null
  booking_ref: string
}

export interface ProviderWorkingHours {
  id: string
  provider_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
}

export interface BookingState {
  step: number
  // Step 0
  lookupValue: string
  existingClient: Client | null
  isNewClient: boolean
  isFirstVisit: boolean | null
  howDidYouHear: string | null
  referredByName: string | null
  // Step 1
  selectedService: Service | null
  // Step 2
  selectedProvider: Provider | null
  bookWithAnyone: boolean
  // Step 3
  selectedDate: string | null
  selectedTime: string | null
  // Step 4
  firstName: string
  lastName: string
  phone: string
  email: string
  petName: string
  petType: string
  petNotes: string
  inspirationPhotoUrl: string | null
  paymentMethodId: string | null
  // Step 5
  bookingRef: string | null
  appointmentId: string | null
}
