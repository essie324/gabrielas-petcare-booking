'use client'

import { useState, useEffect, useCallback } from 'react'
import { verifyAdminPassword, getAppointments, getProviders, updateAppointmentStatus } from './actions'

interface AppointmentWithDetails {
  id: string
  starts_at: string
  ends_at: string
  status: string
  booking_ref: string
  notes: string | null
  referred_by_name: string | null
  how_did_you_hear: string | null
  clients: {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    pet_name: string | null
    pet_type: string | null
    pet_notes: string | null
  }
  providers: {
    id: string
    first_name: string
    last_name: string
  }
  services: {
    id: string
    name: string
    duration_minutes: number
    price_cents: number
  }
}

interface ProviderInfo {
  id: string
  first_name: string
  last_name: string
  booking_status: string
}

function formatTime(isoString: string) {
  const d = new Date(isoString)
  const h = d.getHours()
  const m = d.getMinutes()
  const h12 = h % 12 || 12
  const ampm = h < 12 ? 'AM' : 'PM'
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatPhone(phone: string | null) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`
  }
  return phone
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  no_show: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [providers, setProviders] = useState<ProviderInfo[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week')
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getDateRange = useCallback(() => {
    const base = new Date(currentDate + 'T12:00:00')
    if (viewMode === 'day') {
      return { from: currentDate, to: currentDate }
    }
    // Week view: get Monday to Sunday
    const day = base.getDay()
    const monday = new Date(base)
    monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const from = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
    const to = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`
    return { from, to }
  }, [currentDate, viewMode])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { from, to } = getDateRange()
    const [appts, provs] = await Promise.all([
      getAppointments(from, to),
      getProviders(),
    ])
    setAppointments(appts as AppointmentWithDetails[])
    setProviders(provs as ProviderInfo[])
    setLoading(false)
  }, [getDateRange])

  useEffect(() => {
    if (authenticated) fetchData()
  }, [authenticated, fetchData])

  const handleLogin = async () => {
    const valid = await verifyAdminPassword(password)
    if (valid) {
      setAuthenticated(true)
      setLoginError('')
    } else {
      setLoginError('Incorrect password')
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    await updateAppointmentStatus(appointmentId, newStatus)
    fetchData()
  }

  const navigate = (direction: number) => {
    const base = new Date(currentDate + 'T12:00:00')
    const days = viewMode === 'day' ? 1 : 7
    base.setDate(base.getDate() + direction * days)
    setCurrentDate(`${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`)
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`)
  }

  // Filter appointments
  const filtered = selectedProvider === 'all'
    ? appointments
    : appointments.filter(a => a.providers.id === selectedProvider)

  // Group by date
  const grouped: Record<string, AppointmentWithDetails[]> = {}
  filtered.forEach(a => {
    const dateKey = a.starts_at.split('T')[0]
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(a)
  })

  // Get all dates in range for display
  const { from, to } = getDateRange()
  const allDates: string[] = []
  const d = new Date(from + 'T12:00:00')
  const end = new Date(to + 'T12:00:00')
  while (d <= end) {
    allDates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    d.setDate(d.getDate() + 1)
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="bg-white border border-brand-border rounded-2xl p-8 w-full max-w-sm">
          <h1 className="font-heading text-2xl text-brand-dark mb-2 text-center">Staff Login</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Gabriela&apos;s Premier Pet Care</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
                placeholder="Enter admin password"
              />
              {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-[#2a2a2a] transition"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-border">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl text-brand-dark">Staff Dashboard</h1>
            <p className="text-sm text-gray-400">Gabriela&apos;s Premier Pet Care</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-500 hover:text-brand-dark transition">View Site</a>
            <button
              onClick={() => setAuthenticated(false)}
              className="text-sm text-gray-500 hover:text-brand-dark transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            {/* Navigation */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-brand-border hover:bg-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-lg border border-brand-border hover:bg-white transition text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-2 rounded-lg border border-brand-border hover:bg-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="font-heading text-lg text-brand-dark ml-2">
              {viewMode === 'day'
                ? new Date(currentDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                : `${formatDate(from)} — ${formatDate(to)}`
              }
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex rounded-lg border border-brand-border overflow-hidden">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 text-sm font-medium transition ${viewMode === 'day' ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark hover:bg-brand-surface'}`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-sm font-medium transition ${viewMode === 'week' ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark hover:bg-brand-surface'}`}
              >
                Week
              </button>
            </div>

            {/* Provider filter */}
            <select
              value={selectedProvider}
              onChange={e => setSelectedProvider(e.target.value)}
              className="px-4 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30"
            >
              <option value="all">All Staff</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-400">
            <div className="w-8 h-8 border-2 border-brand-dark border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading appointments...
          </div>
        )}

        {/* Calendar */}
        {!loading && (
          <div className="space-y-6">
            {allDates.map(dateStr => {
              const dayAppts = grouped[dateStr] || []
              const isToday = dateStr === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`

              return (
                <div key={dateStr}>
                  <div className={`flex items-center gap-3 mb-3 ${isToday ? '' : ''}`}>
                    <div className={`font-heading text-sm uppercase tracking-wider ${isToday ? 'text-brand-dark font-bold' : 'text-gray-400'}`}>
                      {formatDate(dateStr)}
                    </div>
                    {isToday && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-dark text-white font-medium">Today</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex-1 border-t border-brand-border" />
                  </div>

                  {dayAppts.length === 0 ? (
                    <div className="text-sm text-gray-400 pl-4 py-2">No appointments</div>
                  ) : (
                    <div className="space-y-3">
                      {dayAppts.map(appt => {
                        const isExpanded = expandedId === appt.id
                        return (
                          <div
                            key={appt.id}
                            className="bg-white border border-brand-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Main row */}
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                              className="w-full p-5 text-left"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-4">
                                  <div className="text-center min-w-[60px]">
                                    <div className="font-heading text-lg text-brand-dark">{formatTime(appt.starts_at)}</div>
                                    <div className="text-xs text-gray-400">{appt.services.duration_minutes} min</div>
                                  </div>
                                  <div className="w-px h-10 bg-brand-border" />
                                  <div>
                                    <div className="font-medium text-brand-dark">
                                      {appt.clients.first_name} {appt.clients.last_name}
                                      {appt.clients.pet_name && (
                                        <span className="text-gray-400 font-normal"> &amp; {appt.clients.pet_name}</span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">{appt.services.name}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-gray-400">
                                    {appt.providers.first_name}
                                  </span>
                                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[appt.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                    {appt.status.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs font-mono text-gray-400">{appt.booking_ref}</span>
                                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </button>

                            {/* Expanded details */}
                            {isExpanded && (
                              <div className="border-t border-brand-border px-5 py-4 bg-brand-surface/30">
                                <div className="grid md:grid-cols-3 gap-6">
                                  {/* Client info */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Client</h4>
                                    <p className="text-sm text-brand-dark font-medium">{appt.clients.first_name} {appt.clients.last_name}</p>
                                    {appt.clients.email && (
                                      <p className="text-sm text-gray-500">
                                        <a href={`mailto:${appt.clients.email}`} className="underline hover:no-underline">{appt.clients.email}</a>
                                      </p>
                                    )}
                                    {appt.clients.phone && (
                                      <p className="text-sm text-gray-500">
                                        <a href={`tel:${appt.clients.phone}`} className="underline hover:no-underline">{formatPhone(appt.clients.phone)}</a>
                                      </p>
                                    )}
                                  </div>

                                  {/* Pet info */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pet</h4>
                                    {appt.clients.pet_name && <p className="text-sm text-brand-dark font-medium">{appt.clients.pet_name}</p>}
                                    {appt.clients.pet_type && <p className="text-sm text-gray-500">{appt.clients.pet_type}</p>}
                                    {appt.clients.pet_notes && <p className="text-sm text-gray-500 mt-1">{appt.clients.pet_notes}</p>}
                                  </div>

                                  {/* Booking info */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Booking</h4>
                                    <p className="text-sm text-gray-500">
                                      {formatTime(appt.starts_at)} — {formatTime(appt.ends_at)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {appt.services.price_cents === 0 ? 'Free' : `$${(appt.services.price_cents / 100).toFixed(0)}`}
                                    </p>
                                    <p className="text-sm text-gray-500">Provider: {appt.providers.first_name} {appt.providers.last_name}</p>
                                    {appt.referred_by_name && <p className="text-sm text-gray-500 mt-1">Referred by: {appt.referred_by_name}</p>}
                                    {appt.how_did_you_hear && <p className="text-sm text-gray-500">Found via: {appt.how_did_you_hear}</p>}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-brand-border">
                                  <span className="text-xs text-gray-400 mr-2">Update status:</span>
                                  {['confirmed', 'completed', 'cancelled', 'no_show'].map(status => (
                                    <button
                                      key={status}
                                      onClick={() => handleStatusChange(appt.id, status)}
                                      disabled={appt.status === status}
                                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                                        appt.status === status
                                          ? statusColors[status] + ' opacity-100'
                                          : 'bg-white border-brand-border text-gray-500 hover:bg-brand-surface'
                                      }`}
                                    >
                                      {status.replace('_', ' ')}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-brand-surface rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg text-brand-dark mb-1">No appointments</h3>
            <p className="text-sm text-gray-400">Nothing scheduled for this {viewMode === 'day' ? 'day' : 'week'}.</p>
          </div>
        )}
      </main>
    </div>
  )
}
