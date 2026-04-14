'use client'

import { useState, useEffect, useCallback } from 'react'

interface TimeSlot {
  time: string
  label: string
  period: 'morning' | 'afternoon' | 'evening'
  available: boolean
}

interface Props {
  providerId: string
  serviceDuration: number
  onSelect: (date: string, time: string) => void
}

export default function Step3DateTime({ providerId, serviceDuration, onSelect }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingDays, setLoadingDays] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const fetchDays = useCallback(async () => {
    setLoadingDays(true)
    try {
      const res = await fetch(
        `/api/booking/available-days?providerId=${providerId}&month=${currentMonth}&duration=${serviceDuration}`
      )
      const data = await res.json()
      setAvailableDays(data.availableDays || [])
    } catch {
      setAvailableDays([])
    } finally {
      setLoadingDays(false)
    }
  }, [providerId, currentMonth, serviceDuration])

  useEffect(() => { fetchDays() }, [fetchDays])

  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true)
    try {
      const res = await fetch(
        `/api/booking/available-slots?providerId=${providerId}&date=${date}&duration=${serviceDuration}`
      )
      const data = await res.json()
      setSlots(data.slots || [])
    } catch {
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [providerId, serviceDuration])

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    fetchSlots(dateStr)
  }

  // Calendar rendering
  const [year, month] = currentMonth.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1)
    const now = new Date()
    if (d.getFullYear() > now.getFullYear() || (d.getFullYear() === now.getFullYear() && d.getMonth() >= now.getMonth())) {
      setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
      setSelectedDate(null)
      setSlots([])
    }
  }

  const nextMonth = () => {
    const d = new Date(year, month, 1)
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    setSelectedDate(null)
    setSlots([])
  }

  const morningSlots = slots.filter(s => s.period === 'morning' && s.available)
  const afternoonSlots = slots.filter(s => s.period === 'afternoon' && s.available)
  const eveningSlots = slots.filter(s => s.period === 'evening' && s.available)

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-heading text-3xl sm:text-4xl text-brand-dark mb-2 text-center">
        Pick a Date & Time
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Select when you&apos;d like your appointment.
      </p>

      {/* Calendar */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="p-2 hover:bg-brand-surface rounded-lg transition">
            <svg className="w-5 h-5 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-heading text-xl text-brand-dark font-semibold">{monthName}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-brand-surface rounded-lg transition">
            <svg className="w-5 h-5 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isAvailable = availableDays.includes(dateStr)
            const isSelected = selectedDate === dateStr

            return (
              <button
                key={day}
                disabled={!isAvailable || loadingDays}
                onClick={() => isAvailable && handleDateClick(dateStr)}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-dark text-white shadow-lg'
                    : isAvailable
                    ? 'text-brand-dark hover:bg-brand-dark/10 hover:text-brand-dark cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="bg-white border border-brand-border rounded-2xl p-5 sm:p-6">
          {loadingSlots ? (
            <div className="text-center py-8 text-gray-400">Loading times...</div>
          ) : slots.filter(s => s.available).length === 0 ? (
            <div className="text-center py-8 text-gray-400">No available times this day.</div>
          ) : (
            <div className="space-y-5">
              {morningSlots.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Morning</p>
                  <div className="flex flex-wrap gap-2">
                    {morningSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => onSelect(selectedDate, slot.time)}
                        className="px-4 py-2.5 rounded-xl border border-brand-border text-sm font-medium text-brand-dark hover:bg-brand-dark hover:text-white hover:border-brand-dark transition"
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {afternoonSlots.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Afternoon</p>
                  <div className="flex flex-wrap gap-2">
                    {afternoonSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => onSelect(selectedDate, slot.time)}
                        className="px-4 py-2.5 rounded-xl border border-brand-border text-sm font-medium text-brand-dark hover:bg-brand-dark hover:text-white hover:border-brand-dark transition"
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {eveningSlots.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Evening</p>
                  <div className="flex flex-wrap gap-2">
                    {eveningSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => onSelect(selectedDate, slot.time)}
                        className="px-4 py-2.5 rounded-xl border border-brand-border text-sm font-medium text-brand-dark hover:bg-brand-dark hover:text-white hover:border-brand-dark transition"
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
