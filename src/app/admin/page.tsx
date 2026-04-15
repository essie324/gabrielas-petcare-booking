'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  verifyAdminPassword,
  getAppointments,
  getProviders,
  updateAppointmentStatus,
  getWorkingHours,
  updateWorkingHours,
  updateProviderStatus,
  updateProviderInfo,
  addProvider,
  removeProvider,
} from './actions'

/* ── Types ─────────────────────────────────── */

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
    id: string; first_name: string; last_name: string
    email: string | null; phone: string | null
    pet_name: string | null; pet_type: string | null; pet_notes: string | null
  }
  providers: { id: string; first_name: string; last_name: string }
  services: { id: string; name: string; duration_minutes: number; price_cents: number }
}

interface ProviderInfo {
  id: string; first_name: string; last_name: string
  email: string | null; phone: string | null
  booking_status: string; bio: string | null
}

interface WorkingHourRow {
  id: string; provider_id: string; day_of_week: number
  start_time: string; end_time: string; is_working: boolean
  providers: { first_name: string; last_name: string }
}

/* ── Helpers ───────────────────────────────── */

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function fmtTime(iso: string) {
  const d = new Date(iso)
  const h = d.getHours(), m = d.getMinutes()
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

function fmtPhone(p: string | null) {
  if (!p) return ''
  const d = p.replace(/\D/g, '')
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`
  return p
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayStr() { return toDateStr(new Date()) }

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  no_show: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

const STATUS_DOT: Record<string, string> = {
  confirmed: 'bg-green-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-400',
  no_show: 'bg-yellow-500',
}

/* ── Edit Provider Form ────────────────────── */

function EditProviderForm({ provider, onSave, onCancel }: {
  provider: ProviderInfo
  onSave: (id: string, email: string, phone: string, bio: string) => void
  onCancel: () => void
}) {
  const [email, setEmail] = useState(provider.email || '')
  const [phone, setPhone] = useState(provider.phone || '')
  const [bio, setBio] = useState(provider.bio || '')

  return (
    <div className="ml-[52px] mt-3 space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="For booking notifications"
            className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 transition" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="For text alerts"
            className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 transition" />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Bio</label>
        <input value={bio} onChange={e => setBio(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 transition" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(provider.id, email, phone, bio)}
          className="text-xs px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-[#2a2a2a] transition">Save</button>
        <button onClick={onCancel}
          className="text-xs px-4 py-2 border border-brand-border text-gray-500 rounded-lg hover:bg-brand-surface transition">Cancel</button>
      </div>
    </div>
  )
}

/* ── Main Component ────────────────────────── */

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'calendar' | 'payments' | 'availability'>('calendar')

  // Calendar state
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [providers, setProviders] = useState<ProviderInfo[]>([])
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [currentMonth, setCurrentMonth] = useState(() => {
    const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Availability state
  const [workingHours, setWorkingHours] = useState<WorkingHourRow[]>([])
  const [loadingHours, setLoadingHours] = useState(false)
  const [savingHourId, setSavingHourId] = useState<string | null>(null)

  // Staff management state
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [newStaff, setNewStaff] = useState({ firstName: '', lastName: '', email: '', phone: '', bio: '', bookingStatus: 'accepting_all' })
  const [addingStaff, setAddingStaff] = useState(false)
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  /* ── Data Fetching ─────────────────────────── */

  const fetchCalendarData = useCallback(async () => {
    setLoading(true)
    const { year, month } = currentMonth
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    const [appts, provs] = await Promise.all([getAppointments(from, to), getProviders()])
    setAppointments(appts as AppointmentWithDetails[])
    setProviders(provs as ProviderInfo[])
    setLoading(false)
  }, [currentMonth])

  const fetchAvailability = useCallback(async () => {
    setLoadingHours(true)
    const [hours, provs] = await Promise.all([getWorkingHours(), getProviders()])
    setWorkingHours(hours as WorkingHourRow[])
    setProviders(provs as ProviderInfo[])
    setLoadingHours(false)
  }, [])

  useEffect(() => {
    if (!authenticated) return
    if (activeTab === 'calendar') fetchCalendarData()
    if (activeTab === 'availability') fetchAvailability()
  }, [authenticated, activeTab, fetchCalendarData, fetchAvailability])

  /* ── Handlers ──────────────────────────────── */

  const handleLogin = async () => {
    if (await verifyAdminPassword(password)) { setAuthenticated(true); setLoginError('') }
    else setLoginError('Incorrect password')
  }

  const handleStatusChange = async (id: string, status: string) => {
    await updateAppointmentStatus(id, status)
    fetchCalendarData()
  }

  const handleHourToggle = async (row: WorkingHourRow) => {
    setSavingHourId(row.id)
    await updateWorkingHours(row.id, { is_working: !row.is_working })
    await fetchAvailability()
    setSavingHourId(null)
  }

  const handleHourChange = async (row: WorkingHourRow, field: 'start_time' | 'end_time', value: string) => {
    setSavingHourId(row.id)
    await updateWorkingHours(row.id, { [field]: value })
    await fetchAvailability()
    setSavingHourId(null)
  }

  const handleProviderStatusChange = async (providerId: string, status: string) => {
    await updateProviderStatus(providerId, status)
    await fetchAvailability()
  }

  const handleAddStaff = async () => {
    if (!newStaff.firstName.trim() || !newStaff.lastName.trim()) return
    setAddingStaff(true)
    await addProvider(newStaff)
    setNewStaff({ firstName: '', lastName: '', email: '', phone: '', bio: '', bookingStatus: 'accepting_all' })
    setShowAddStaff(false)
    setAddingStaff(false)
    await fetchAvailability()
  }

  const handleRemoveStaff = async (providerId: string) => {
    await removeProvider(providerId)
    setConfirmRemoveId(null)
    await fetchAvailability()
  }

  const handleSaveProviderInfo = async (providerId: string, email: string, phone: string, bio: string) => {
    await updateProviderInfo(providerId, { email: email || undefined, phone: phone || undefined, bio: bio || undefined })
    setEditingProviderId(null)
    await fetchAvailability()
  }

  /* ── Calendar Grid Logic ───────────────────── */

  const { year, month } = currentMonth
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    setCurrentMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 })
    setSelectedDate(null)
  }
  const nextMonth = () => {
    setCurrentMonth(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 })
    setSelectedDate(null)
  }
  const goToToday = () => {
    const n = new Date()
    setCurrentMonth({ year: n.getFullYear(), month: n.getMonth() })
    setSelectedDate(todayStr())
  }

  // Group appointments by date
  const apptsByDate: Record<string, AppointmentWithDetails[]> = {}
  const filtered = selectedProvider === 'all' ? appointments : appointments.filter(a => a.providers.id === selectedProvider)
  filtered.forEach(a => {
    const key = a.starts_at.split('T')[0]
    if (!apptsByDate[key]) apptsByDate[key] = []
    apptsByDate[key].push(a)
  })

  // Selected day appointments
  const dayAppts = selectedDate ? (apptsByDate[selectedDate] || []) : []

  /* ── Login Screen ──────────────────────────── */

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
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
                placeholder="Enter admin password"
              />
              {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}
            </div>
            <button onClick={handleLogin} className="w-full py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-[#2a2a2a] transition">Log In</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Dashboard Shell ───────────────────────── */

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
            <button onClick={() => setAuthenticated(false)} className="text-sm text-gray-500 hover:text-brand-dark transition">Log Out</button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-brand-border bg-brand-bg">
        <div className="max-w-[1400px] mx-auto px-6 flex gap-0">
          {([
            { key: 'calendar', label: 'Calendar' },
            { key: 'payments', label: 'Payments' },
            { key: 'availability', label: 'Availability' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-brand-dark text-brand-dark'
                  : 'border-transparent text-gray-400 hover:text-brand-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 py-8">

        {/* ═══════════════════ CALENDAR TAB ═══════════════════ */}
        {activeTab === 'calendar' && (
          <div className="grid lg:grid-cols-[1fr_420px] gap-8">
            {/* Left: Calendar Grid */}
            <div>
              {/* Month nav */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <button onClick={prevMonth} className="p-2 rounded-lg border border-brand-border hover:bg-white transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <h2 className="font-heading text-xl text-brand-dark min-w-[200px] text-center">{monthLabel}</h2>
                  <button onClick={nextMonth} className="p-2 rounded-lg border border-brand-border hover:bg-white transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <button onClick={goToToday} className="px-4 py-2 rounded-lg border border-brand-border hover:bg-white transition text-sm font-medium ml-2">Today</button>
                </div>
                <select
                  value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30"
                >
                  <option value="all">All Staff</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>

              {/* Grid */}
              <div className="bg-white border border-brand-border rounded-2xl overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-brand-border">
                  {DAY_SHORT.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-3">{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {/* Empty leading cells */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`e-${i}`} className="border-b border-r border-brand-border min-h-[100px] bg-brand-surface/30" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const isToday = dateStr === todayStr()
                    const isSelected = dateStr === selectedDate
                    const dayCount = (apptsByDate[dateStr] || []).length
                    const cellIndex = firstDayOfWeek + i

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`border-b border-r border-brand-border min-h-[100px] p-2 text-left transition relative ${
                          isSelected ? 'bg-brand-dark/5 ring-2 ring-inset ring-brand-dark' : 'hover:bg-brand-surface/50'
                        } ${cellIndex % 7 === 6 ? 'border-r-0' : ''}`}
                      >
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                          isToday ? 'bg-brand-dark text-white' : 'text-brand-dark'
                        }`}>
                          {day}
                        </span>
                        {dayCount > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {(apptsByDate[dateStr] || []).slice(0, 3).map(a => (
                              <div key={a.id} className="flex items-center gap-1 px-1">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[a.status] || 'bg-gray-400'}`} />
                                <span className="text-[11px] text-gray-600 truncate">{fmtTime(a.starts_at)} {a.clients.first_name}</span>
                              </div>
                            ))}
                            {dayCount > 3 && (
                              <p className="text-[11px] text-gray-400 px-1">+{dayCount - 3} more</p>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}

                  {/* Trailing empty cells */}
                  {Array.from({ length: (7 - (firstDayOfWeek + daysInMonth) % 7) % 7 }).map((_, i) => (
                    <div key={`t-${i}`} className="border-b border-r border-brand-border min-h-[100px] bg-brand-surface/30" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Day Detail Sidebar */}
            <div>
              <div className="sticky top-[120px]">
                <h3 className="font-heading text-lg text-brand-dark mb-4">
                  {selectedDate
                    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                    : 'Select a day'}
                </h3>

                {loading && <p className="text-sm text-gray-400">Loading...</p>}

                {!loading && selectedDate && dayAppts.length === 0 && (
                  <div className="bg-white border border-brand-border rounded-2xl p-8 text-center">
                    <p className="text-sm text-gray-400">No appointments this day.</p>
                  </div>
                )}

                {!loading && dayAppts.length > 0 && (
                  <div className="space-y-3">
                    {dayAppts.map(appt => {
                      const isExpanded = expandedId === appt.id
                      return (
                        <div key={appt.id} className="bg-white border border-brand-border rounded-2xl overflow-hidden">
                          <button onClick={() => setExpandedId(isExpanded ? null : appt.id)} className="w-full p-4 text-left">
                            <div className="flex items-center gap-3">
                              <div className="min-w-[56px]">
                                <div className="font-heading text-sm text-brand-dark">{fmtTime(appt.starts_at)}</div>
                                <div className="text-[11px] text-gray-400">{appt.services.duration_minutes}m</div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-brand-dark truncate">
                                  {appt.clients.first_name} {appt.clients.last_name}
                                  {appt.clients.pet_name && <span className="text-gray-400 font-normal"> &amp; {appt.clients.pet_name}</span>}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{appt.services.name} · {appt.providers.first_name}</p>
                              </div>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${STATUS_COLORS[appt.status]}`}>
                                {appt.status.replace('_', ' ')}
                              </span>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-brand-border px-4 py-3 bg-brand-surface/30 space-y-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Client</p>
                                  <p className="text-brand-dark font-medium">{appt.clients.first_name} {appt.clients.last_name}</p>
                                  {appt.clients.email && <p className="text-gray-500"><a href={`mailto:${appt.clients.email}`} className="underline">{appt.clients.email}</a></p>}
                                  {appt.clients.phone && <p className="text-gray-500"><a href={`tel:${appt.clients.phone}`} className="underline">{fmtPhone(appt.clients.phone)}</a></p>}
                                </div>
                                <div>
                                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Pet</p>
                                  {appt.clients.pet_name && <p className="text-brand-dark font-medium">{appt.clients.pet_name}</p>}
                                  {appt.clients.pet_type && <p className="text-gray-500">{appt.clients.pet_type}</p>}
                                  {appt.clients.pet_notes && <p className="text-gray-500 text-xs mt-0.5">{appt.clients.pet_notes}</p>}
                                </div>
                              </div>
                              <div className="text-sm">
                                <p className="text-gray-500">{fmtTime(appt.starts_at)} — {fmtTime(appt.ends_at)} · {appt.services.price_cents === 0 ? 'Free' : `$${(appt.services.price_cents / 100).toFixed(0)}`}</p>
                                <p className="text-xs text-gray-400 font-mono mt-1">Ref: {appt.booking_ref}</p>
                                {appt.referred_by_name && <p className="text-xs text-gray-400">Referred by: {appt.referred_by_name}</p>}
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-brand-border">
                                {['confirmed', 'completed', 'cancelled', 'no_show'].map(s => (
                                  <button key={s} onClick={() => handleStatusChange(appt.id, s)} disabled={appt.status === s}
                                    className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition ${appt.status === s ? STATUS_COLORS[s] : 'bg-white border-brand-border text-gray-500 hover:bg-brand-surface'}`}
                                  >
                                    {s.replace('_', ' ')}
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
            </div>
          </div>
        )}

        {/* ═══════════════════ PAYMENTS TAB ═══════════════════ */}
        {activeTab === 'payments' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl text-brand-dark mb-2">Payment Processing</h2>
            <p className="text-gray-500 mb-8">Connect a payment processor to accept online payments for bookings.</p>

            <div className="space-y-4">
              {/* Stripe */}
              <div className="bg-white border border-brand-border rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#635BFF]/10 flex items-center justify-center">
                      <span className="text-[#635BFF] font-bold text-lg">S</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-lg text-brand-dark">Stripe</h3>
                      <p className="text-sm text-gray-500">Accept credit cards, Apple Pay, Google Pay. 2.9% + 30¢ per transaction.</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 font-medium">Not connected</span>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-border">
                  <p className="text-sm text-gray-500 mb-3">To connect Stripe, you&apos;ll need to create a Stripe account and add your API keys.</p>
                  <a href="https://stripe.com" target="_blank" rel="noopener noreferrer"
                    className="inline-block px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-medium hover:bg-[#2a2a2a] transition">
                    Set Up Stripe
                  </a>
                </div>
              </div>

              {/* Square */}
              <div className="bg-white border border-brand-border rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#006AFF]/10 flex items-center justify-center">
                      <span className="text-[#006AFF] font-bold text-lg">Sq</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-lg text-brand-dark">Square</h3>
                      <p className="text-sm text-gray-500">In-person and online payments. 2.6% + 10¢ per transaction.</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 font-medium">Not connected</span>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-border">
                  <p className="text-sm text-gray-500 mb-3">Square works well for businesses that also accept in-person payments.</p>
                  <a href="https://squareup.com" target="_blank" rel="noopener noreferrer"
                    className="inline-block px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-medium hover:bg-[#2a2a2a] transition">
                    Set Up Square
                  </a>
                </div>
              </div>

              {/* Cash / Venmo / Zelle */}
              <div className="bg-white border border-brand-border rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">$</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-brand-dark">Cash / Venmo / Zelle</h3>
                    <p className="text-sm text-gray-500">Collect payment in person or through peer-to-peer apps. No processing fees.</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-border">
                  <p className="text-sm text-gray-500">This is the current default. Clients book online and pay at the time of service. No integration needed.</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-700 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ AVAILABILITY TAB ═══════════════════ */}
        {activeTab === 'availability' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl text-brand-dark mb-1">Staff & Availability</h2>
                <p className="text-gray-500">Manage team members, working hours, and booking status.</p>
              </div>
              <button
                onClick={() => setShowAddStaff(true)}
                className="px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-medium hover:bg-[#2a2a2a] transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Staff
              </button>
            </div>

            {/* Add Staff Form */}
            {showAddStaff && (
              <div className="bg-white border border-brand-border rounded-2xl p-6 mb-6">
                <h3 className="font-heading text-lg text-brand-dark mb-4">Add New Staff Member</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">First name *</label>
                    <input value={newStaff.firstName} onChange={e => setNewStaff(s => ({ ...s, firstName: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 transition" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Last name *</label>
                    <input value={newStaff.lastName} onChange={e => setNewStaff(s => ({ ...s, lastName: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 transition" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Email</label>
                    <input type="email" value={newStaff.email} onChange={e => setNewStaff(s => ({ ...s, email: e.target.value }))}
                      placeholder="For booking notifications"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/30 transition" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Phone</label>
                    <input type="tel" value={newStaff.phone} onChange={e => setNewStaff(s => ({ ...s, phone: e.target.value }))}
                      placeholder="For text alerts"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/30 transition" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm text-gray-500 mb-1 block">Bio</label>
                  <input value={newStaff.bio} onChange={e => setNewStaff(s => ({ ...s, bio: e.target.value }))}
                    placeholder="Short description shown to clients"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-dark/30 transition" />
                </div>
                <div className="mb-5">
                  <label className="text-sm text-gray-500 mb-1 block">Booking status</label>
                  <select value={newStaff.bookingStatus} onChange={e => setNewStaff(s => ({ ...s, bookingStatus: e.target.value }))}
                    className="px-4 py-2.5 rounded-xl border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30">
                    <option value="accepting_all">Accepting all bookings</option>
                    <option value="referral_only">Referral only</option>
                    <option value="closed">Not accepting</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddStaff} disabled={addingStaff || !newStaff.firstName.trim() || !newStaff.lastName.trim()}
                    className="px-6 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-medium hover:bg-[#2a2a2a] transition disabled:opacity-40">
                    {addingStaff ? 'Adding...' : 'Add Staff Member'}
                  </button>
                  <button onClick={() => setShowAddStaff(false)}
                    className="px-6 py-2.5 border border-brand-border text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-surface transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {loadingHours && (
              <div className="text-center py-12 text-gray-400">
                <div className="w-8 h-8 border-2 border-brand-dark border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading...
              </div>
            )}

            {!loadingHours && providers.map(provider => {
              const hours = workingHours.filter(h => h.provider_id === provider.id)
              const isEditing = editingProviderId === provider.id

              return (
                <div key={provider.id} className="bg-white border border-brand-border rounded-2xl mb-6 overflow-hidden">
                  {/* Provider header */}
                  <div className="p-5 border-b border-brand-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center font-heading font-bold text-brand-dark">
                          {provider.first_name[0]}
                        </div>
                        <div>
                          <h3 className="font-heading text-lg text-brand-dark">{provider.first_name} {provider.last_name}</h3>
                          <p className="text-xs text-gray-400">{provider.bio || 'Team member'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingProviderId(isEditing ? null : provider.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-brand-border text-gray-500 hover:bg-brand-surface transition">
                          {isEditing ? 'Cancel' : 'Edit Info'}
                        </button>
                        {confirmRemoveId === provider.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-600 mr-1">Remove?</span>
                            <button onClick={() => handleRemoveStaff(provider.id)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">Yes</button>
                            <button onClick={() => setConfirmRemoveId(null)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-brand-border text-gray-500 hover:bg-brand-surface transition">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmRemoveId(provider.id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contact info row */}
                    {!isEditing && (
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 ml-[52px]">
                        {provider.email && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {provider.email}
                          </span>
                        )}
                        {provider.phone && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {fmtPhone(provider.phone)}
                          </span>
                        )}
                        {!provider.email && !provider.phone && (
                          <span className="text-gray-400 italic">No contact info — click Edit Info to add</span>
                        )}
                      </div>
                    )}

                    {/* Edit form */}
                    {isEditing && (
                      <EditProviderForm
                        provider={provider}
                        onSave={handleSaveProviderInfo}
                        onCancel={() => setEditingProviderId(null)}
                      />
                    )}

                    {/* Booking status */}
                    <div className="flex items-center gap-2 mt-3 ml-[52px]">
                      <label className="text-xs text-gray-500">Status:</label>
                      <select
                        value={provider.booking_status}
                        onChange={e => handleProviderStatusChange(provider.id, e.target.value)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30"
                      >
                        <option value="accepting_all">Accepting all bookings</option>
                        <option value="referral_only">Referral only</option>
                        <option value="closed">Not accepting</option>
                      </select>
                    </div>
                  </div>

                  {/* Working hours grid */}
                  <div className="divide-y divide-brand-border">
                    {hours.sort((a, b) => a.day_of_week - b.day_of_week).map(row => (
                      <div key={row.id} className={`px-5 py-3 flex items-center gap-4 ${!row.is_working ? 'opacity-50' : ''} ${savingHourId === row.id ? 'bg-brand-surface/50' : ''}`}>
                        <span className="w-24 text-sm font-medium text-brand-dark">{DAY_NAMES[row.day_of_week]}</span>
                        <button
                          onClick={() => handleHourToggle(row)}
                          className={`relative w-10 h-6 rounded-full transition-colors ${row.is_working ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${row.is_working ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                        {row.is_working ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input type="time" value={row.start_time.slice(0, 5)}
                              onChange={e => handleHourChange(row, 'start_time', e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30" />
                            <span className="text-gray-400 text-sm">to</span>
                            <input type="time" value={row.end_time.slice(0, 5)}
                              onChange={e => handleHourChange(row, 'end_time', e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30" />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 flex-1">Day off</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
